#!/usr/bin/env python3

import logging
from typing import Dict, Any, Optional
import aiohttp
import json

logger = logging.getLogger("pos-proxy.api")

class ApiClient:
    """HTTP client for forwarding API requests."""
    
    def __init__(self, base_url: str, timeout: int = 30):
        """Initialize the API client.
        
        Args:
            base_url: Base URL for the API server
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = None
    
    async def _ensure_session(self):
        """Ensure that an aiohttp session exists."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.timeout),
                headers={"User-Agent": "POS-Bluetooth-Proxy/1.0"}
            )
    
    async def request(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make an HTTP request to the API.
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint (will be appended to base URL)
            data: Data to send with the request (for POST, PUT)
            
        Returns:
            API response as a dictionary with format {data: Any, error: str|None, status: int}
        """
        await self._ensure_session()
        
        # Normalize endpoint (ensure it starts with /)
        if not endpoint.startswith('/'):
            endpoint = f"/{endpoint}"
        
        url = f"{self.base_url}{endpoint}"
        method = method.upper()
        
        logger.info(f"Making {method} request to {url}")
        
        try:
            async with self.session.request(
                method=method, 
                url=url,
                json=data if data and method in ('POST', 'PUT', 'PATCH') else None,
                params=data if data and method == 'GET' else None
            ) as response:
                status_code = response.status
                logger.debug(f"Received response with status: {status_code}")
                
                try:
                    # Try to parse JSON response
                    response_data = await response.json()
                except json.JSONDecodeError:
                    # If not JSON, get the raw text
                    text = await response.text()
                    response_data = {"text": text}
                
                if 200 <= status_code < 300:
                    return {
                        "data": response_data,
                        "error": None,
                        "status": status_code
                    }
                else:
                    error_msg = response_data.get("error", "Unknown error")
                    logger.warning(f"API error: {status_code} - {error_msg}")
                    return {
                        "data": None, 
                        "error": error_msg,
                        "status": status_code
                    }
                
        except aiohttp.ClientError as e:
            logger.error(f"HTTP request failed: {e}")
            return {
                "data": None,
                "error": f"Connection error: {str(e)}",
                "status": 0
            }
        except Exception as e:
            logger.error(f"Unexpected error during API request: {e}")
            return {
                "data": None,
                "error": f"Internal error: {str(e)}",
                "status": 500
            }
    
    async def close(self):
        """Close the HTTP session."""
        if self.session and not self.session.closed:
            await self.session.close()
