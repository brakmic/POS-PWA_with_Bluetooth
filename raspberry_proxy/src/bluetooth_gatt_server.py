#!/usr/bin/env python3

import asyncio
import json
import os
import signal
import sys
import logging
from typing import Dict, Any, Optional, List
import uuid
from datetime import datetime

import aioconsole
from bleak import BleakServer
from bleak.backends.characteristic import BleakGATTCharacteristic
from bleak.backends.service import BleakGATTService
from bleak_tools.assigned_numbers import AdvertisementDataType
import aiohttp
from dotenv import load_dotenv

from .api_client import ApiClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("pos-proxy")

# Load environment variables from .env file
load_dotenv()

# Configuration from environment variables
API_BASE_URL = os.getenv("API_BASE_URL", "https://bt-api.local")
BLUETOOTH_SERVICE_UUID = os.getenv("BLUETOOTH_SERVICE_UUID", "00000000-1111-2222-3333-444444444444")
BLUETOOTH_CHARACTERISTIC_UUID = os.getenv("BLUETOOTH_CHARACTERISTIC_UUID", "11111111-2222-3333-4444-555555555555")
BLUETOOTH_DEVICE_NAME = os.getenv("BLUETOOTH_DEVICE_NAME", "POS-Proxy")

# Queue for pending messages to be sent to client
outgoing_message_queue = asyncio.Queue()

# Track active connections
connected_clients = set()

# Pending requests mapping message ID to response handlers
pending_requests: Dict[str, asyncio.Future] = {}

class POSBluetoothServer:
    """Bluetooth GATT Server that bridges HTTP API requests."""
    
    def __init__(self):
        """Initialize the Bluetooth GATT server."""
        self.server = None
        self.api_client = ApiClient(API_BASE_URL)
        self.characteristic = None
        self.is_running = False
        self.connection_count = 0
    
    async def start(self):
        """Start the Bluetooth GATT server."""
        logger.info(f"Starting Bluetooth GATT server with name: {BLUETOOTH_DEVICE_NAME}")
        logger.info(f"Service UUID: {BLUETOOTH_SERVICE_UUID}")
        logger.info(f"Characteristic UUID: {BLUETOOTH_CHARACTERISTIC_UUID}")
        
        # Create the GATT service and characteristic
        service = BleakGATTService(BLUETOOTH_SERVICE_UUID)
        self.characteristic = BleakGATTCharacteristic(
            uuid=BLUETOOTH_CHARACTERISTIC_UUID,
            service_uuid=BLUETOOTH_SERVICE_UUID,
            description="POS Communication Channel",
            read=True,
            write=True, 
            notify=True
        )
        service.add_characteristic(self.characteristic)
        
        # Create the Bluetooth server
        self.server = BleakServer()
        self.server.add_service(service)
        
        # Set callbacks
        self.server.set_connection_handler(self.on_connect)
        self.server.set_disconnection_handler(self.on_disconnect)
        self.characteristic.set_write_handler(self.on_write)
        
        # Start advertising
        advertisement_data = {
            AdvertisementDataType.COMPLETE_LOCAL_NAME: BLUETOOTH_DEVICE_NAME,
            AdvertisementDataType.COMPLETE_SERVICE_CLASS_LIST: [
                int(BLUETOOTH_SERVICE_UUID.split('-')[0], 16)
            ]
        }
        
        await self.server.start(advertisement_data=advertisement_data)
        self.is_running = True
        logger.info("🟢 Bluetooth GATT server started successfully")
        
        # Start the outgoing message handler
        asyncio.create_task(self.handle_outgoing_messages())
        
    async def stop(self):
        """Stop the Bluetooth GATT server."""
        if self.is_running and self.server:
            await self.server.stop()
            self.is_running = False
            logger.info("Bluetooth GATT server stopped")
    
    async def on_connect(self, connection):
        """Handle a new client connection."""
        self.connection_count += 1
        client_id = f"client-{self.connection_count}"
        connected_clients.add(client_id)
        logger.info(f"Client connected: {client_id}")
        
        # Send welcome message
        welcome_message = {
            "type": "system",
            "id": str(uuid.uuid4()),
            "timestamp": int(datetime.now().timestamp() * 1000),
            "payload": {
                "message": "Connected to POS Bluetooth Proxy",
                "protocolVersion": "1.0",
                "deviceInfo": {
                    "name": BLUETOOTH_DEVICE_NAME,
                    "serviceUUID": BLUETOOTH_SERVICE_UUID,
                    "characteristicUUID": BLUETOOTH_CHARACTERISTIC_UUID
                }
            }
        }
        
        await self.send_message(welcome_message)
        
        return client_id
    
    async def on_disconnect(self, client_id):
        """Handle a client disconnection."""
        if client_id in connected_clients:
            connected_clients.remove(client_id)
            logger.info(f"Client disconnected: {client_id}")
    
    async def on_write(self, characteristic: BleakGATTCharacteristic, data: bytearray):
        """Handle data written to the characteristic."""
        try:
            # Decode the received data
            message_str = data.decode('utf-8')
            message = json.loads(message_str)
            logger.info(f"Received message: {message.get('type')} - {message.get('endpoint')}")
            
            # Process message
            asyncio.create_task(self.process_message(message))
            
            return True
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {data}")
            await self.send_error("Invalid JSON format", status=400)
            return False
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            await self.send_error(f"Internal server error: {str(e)}", status=500)
            return False
    
    async def process_message(self, message: Dict[str, Any]):
        """Process an incoming message."""
        if message.get("type") != "request":
            logger.warning(f"Received non-request message type: {message.get('type')}")
            return
        
        message_id = message.get("id")
        if not message_id:
            await self.send_error("Missing message ID", status=400)
            return
        
        # Extract request details
        endpoint = message.get("endpoint")
        method = message.get("payload", {}).get("method", "GET")
        data = message.get("payload", {}).get("data")
        
        if not endpoint:
            await self.send_error("Missing endpoint", message_id, status=400)
            return
        
        try:
            # Forward the request to the API
            response = await self.api_client.request(
                method=method,
                endpoint=endpoint,
                data=data
            )
            
            # Send the API response back over Bluetooth
            response_message = {
                "id": message_id,
                "type": "response",
                "endpoint": endpoint,
                "timestamp": int(datetime.now().timestamp() * 1000),
                "payload": response
            }
            
            await self.send_message(response_message)
            
        except aiohttp.ClientError as e:
            logger.error(f"API request error: {e}")
            await self.send_error(
                f"API request failed: {str(e)}", 
                message_id, 
                status=getattr(e, "status", 500),
                endpoint=endpoint
            )
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            await self.send_error(
                f"Internal error: {str(e)}", 
                message_id, 
                status=500,
                endpoint=endpoint
            )
    
    async def send_message(self, message: Dict[str, Any]):
        """Queue a message to be sent to the client."""
        await outgoing_message_queue.put(message)
    
    async def send_error(self, message: str, message_id: Optional[str] = None, status: int = 500, endpoint: str = None):
        """Send an error message to the client."""
        error_message = {
            "id": message_id or str(uuid.uuid4()),
            "type": "error",
            "endpoint": endpoint or "/",
            "timestamp": int(datetime.now().timestamp() * 1000),
            "payload": {
                "message": message,
                "status": status
            }
        }
        await self.send_message(error_message)
    
    async def handle_outgoing_messages(self):
        """Process the queue of outgoing messages."""
        while self.is_running:
            try:
                message = await outgoing_message_queue.get()
                
                # Serialize the message
                message_json = json.dumps(message)
                message_bytes = message_json.encode('utf-8')
                
                # Check if message fits in a single MTU (assuming ~512 bytes to be safe)
                if len(message_bytes) <= 512:
                    # Send as one notification
                    await self.characteristic.notify(message_bytes)
                    logger.debug(f"Sent message: {message.get('type')} - {message.get('id')}")
                else:
                    # Split into chunks and send multiple notifications
                    # This is a simplistic chunking mechanism
                    chunk_size = 512
                    chunks = [message_bytes[i:i+chunk_size] for i in range(0, len(message_bytes), chunk_size)]
                    
                    logger.debug(f"Message too large, sending in {len(chunks)} chunks")
                    
                    for i, chunk in enumerate(chunks):
                        await self.characteristic.notify(chunk)
                        # Small delay to avoid overwhelming the client
                        await asyncio.sleep(0.01)
                    
                    logger.debug(f"Finished sending chunked message: {message.get('type')} - {message.get('id')}")
                
                outgoing_message_queue.task_done()
            except Exception as e:
                logger.error(f"Error sending message: {e}")
                await asyncio.sleep(0.1)  # Avoid tight loop in case of errors

async def interactive_console(server):
    """Run an interactive console for control commands."""
    print("POS Bluetooth Proxy Interactive Console")
    print("Type 'help' for available commands")
    
    while server.is_running:
        try:
            command = await aioconsole.ainput("> ")
            
            if command == "help":
                print("Available commands:")
                print("  status - Show server status")
                print("  clients - Show connected clients")
                print("  stats - Show statistics")
                print("  quit - Stop server and exit")
            
            elif command == "status":
                print(f"Server running: {server.is_running}")
                print(f"API Base URL: {API_BASE_URL}")
                print(f"Device name: {BLUETOOTH_DEVICE_NAME}")
                
            elif command == "clients":
                if connected_clients:
                    print(f"Connected clients: {len(connected_clients)}")
                    for client in connected_clients:
                        print(f"  - {client}")
                else:
                    print("No connected clients")
            
            elif command == "stats":
                print(f"Outgoing queue size: {outgoing_message_queue.qsize()}")
                print(f"Pending requests: {len(pending_requests)}")
                
            elif command == "quit":
                print("Stopping server...")
                await server.stop()
                return
            
            else:
                print(f"Unknown command: {command}")
                
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error: {e}")

async def main_async():
    """Main async entry point."""
    server = POSBluetoothServer()
    
    # Set up signal handlers for graceful shutdown
    loop = asyncio.get_event_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, lambda: asyncio.create_task(server.stop()))
    
    try:
        # Start the server
        await server.start()
        
        # Run the interactive console
        await interactive_console(server)
        
    finally:
        # Ensure server is stopped
        if server.is_running:
            await server.stop()

def main():
    """Main entry point."""
    try:
        print("Starting POS Bluetooth Proxy...")
        asyncio.run(main_async())
    except KeyboardInterrupt:
        print("\nExiting...")
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
