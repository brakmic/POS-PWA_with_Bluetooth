#!/usr/bin/env python3

import os
import sys
import logging
from typing import Dict, Any, Optional
import json
import uuid
from datetime import datetime

def setup_logging(name: str, level: int = logging.INFO) -> logging.Logger:
    """Set up logging configuration.
    
    Args:
        name: Logger name
        level: Logging level
        
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    return logger

def create_message(
    message_type: str, 
    endpoint: str, 
    payload: Any, 
    message_id: Optional[str] = None
) -> Dict[str, Any]:
    """Create a standardized message structure.
    
    Args:
        message_type: Type of message (request, response, error, system)
        endpoint: API endpoint or subject of the message
        payload: Message content
        message_id: Optional message ID (will generate UUID if not provided)
        
    Returns:
        Formatted message dictionary
    """
    return {
        "id": message_id or str(uuid.uuid4()),
        "type": message_type,
        "endpoint": endpoint,
        "payload": payload,
        "timestamp": int(datetime.now().timestamp() * 1000)
    }

def create_error_message(
    error_message: str,
    status: int = 500,
    endpoint: str = "/",
    message_id: Optional[str] = None
) -> Dict[str, Any]:
    """Create a standardized error message.
    
    Args:
        error_message: Error description
        status: HTTP status code equivalent
        endpoint: API endpoint that caused the error
        message_id: Optional message ID (will generate UUID if not provided)
        
    Returns:
        Formatted error message dictionary
    """
    return create_message(
        message_type="error",
        endpoint=endpoint,
        payload={
            "message": error_message,
            "status": status
        },
        message_id=message_id
    )
