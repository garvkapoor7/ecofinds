import requests
import json

# Test data with a new username and email
test_user = {
    "username": "newuser456",
    "email": "newuser456@example.com"
}

# Test creating a user
def test_create_user():
    response = requests.post(
        "http://127.0.0.1:8000/users/",
        json=test_user
    )
    print("\nTesting Create User:")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    test_create_user() 