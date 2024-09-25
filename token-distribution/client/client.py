import requests
import time

def check_status():
    url = "http://server:5000/check-server"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print("Server response:", response.json())
        else:
            print(f"Error: {response.status_code}, {response.text}")
    except requests.ConnectionError:
        print("Failed to connect to server.")

def check_contract():
    url = "http://server:5000/check-contract"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print("Server response:", response.json())
        else:
            print(f"Error: {response.status_code}, {response.text}")
    except requests.ConnectionError:
        print("Failed to connect to server.")

if __name__ == "__main__":
    time.sleep(10) # wait for the server to be ready (did this since I'm launching the instances from a single CLI command)
    
    check_status()
    check_contract()
