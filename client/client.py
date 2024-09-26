import requests
import time

def check_status():
    action = "check-server"
    url = "http://server:5000/" + action
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print("Server response:", response.json())
        else:
            print(f"Error: {response.status_code}, {response.text}")
    except requests.ConnectionError:
        print(action + ": Failed to connect to server.")

def check_contract():
    action = "check-contract"
    url = "http://server:5000/" + action
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print("Server response:", response.json())
        else:
            print(f"Error: {response.status_code}, {response.text}")
    except requests.ConnectionError:
        print(action + ": Failed to connect to server.")

def deploy():
    action = "deploy"
    validatorsThreshold = 5
    timeout = 400 # blocks
    recipientAddress = "0x60FC3E6Ad91Fc02Efa77E91b207603C4C397532f" # we use the same one of the deployment.json file for the sake of brevity

    url = f"http://server:5000/{action}?validatorsThreshold={validatorsThreshold}&timeout={timeout}&recipientAddress={recipientAddress}"

    try:
        response = requests.get(url)
        if response.status_code == 200:
            print("Server response:", response.json())
        else:
            print(f"Error: {response.status_code}, {response.text}")
    except requests.ConnectionError:
        print(action + ": Failed to connect to server.")


if __name__ == "__main__":
    time.sleep(10) # wait for the server to be ready (did this since I'm launching the instances from a single CLI command)
    
    check_status()
    check_contract() # our debugging contract deployed to the binance testnet (the one defined in deployment.json)
    deploy()
    check_contract() # if everything works, it should display the new deployed contract