def test_create_gym_without_address(client):
    response = client.post(
        "/api/lifting/gym",
        json={
            "name": "无地址健身房",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    gym = payload["data"]
    assert gym["name"] == "无地址健身房"
    assert gym["location"] == ""
    assert gym["address"] == ""


def test_create_gym_with_address_compat_field(client):
    response = client.post(
        "/api/lifting/gym",
        json={
            "name": "兼容字段健身房",
            "address": "虹桥路 100 号",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    gym = payload["data"]
    assert gym["location"] == "虹桥路 100 号"
    assert gym["address"] == "虹桥路 100 号"


def test_update_gym_can_clear_address(client):
    create_response = client.post(
        "/api/lifting/gym",
        json={
            "name": "可清空地址健身房",
            "location": "初始地址",
        },
    )
    assert create_response.status_code == 200
    gym_id = create_response.json()["data"]["id"]

    update_response = client.put(
        f"/api/lifting/gym/{gym_id}",
        json={
            "name": "可清空地址健身房",
        },
    )

    assert update_response.status_code == 200
    payload = update_response.json()
    gym = payload["data"]
    assert gym["location"] == ""
    assert gym["address"] == ""
