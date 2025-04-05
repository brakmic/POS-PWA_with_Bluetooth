from setuptools import setup, find_packages

setup(
    name="pos-bluetooth-proxy",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "bleak>=0.19.0",
        "aioconsole>=0.6.0",
        "aiohttp>=3.8.4",
        "python-dotenv>=1.0.0",
    ],
    entry_points={
        'console_scripts': [
            'pos-proxy=src.bluetooth_gatt_server:main',
        ],
    },
    description="Bluetooth GATT server for POS PWA",
    author="Your Name",
)