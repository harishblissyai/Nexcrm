def test_dashboard_empty(client, auth_headers):
    r = client.get("/api/dashboard/stats", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["total_contacts"] == 0
    assert data["total_leads"] == 0
    assert "leads_by_status" in data
    assert "recent_activities" in data
    assert isinstance(data["leads_by_status"], dict)


def test_dashboard_counts(client, auth_headers):
    client.post("/api/contacts", json={"name": "Alice"}, headers=auth_headers)
    client.post("/api/contacts", json={"name": "Bob"}, headers=auth_headers)
    client.post("/api/leads", json={"title": "Deal 1", "status": "New"}, headers=auth_headers)
    client.post("/api/leads", json={"title": "Deal 2", "status": "ClosedWon"}, headers=auth_headers)

    r = client.get("/api/dashboard/stats", headers=auth_headers)
    data = r.json()
    assert data["total_contacts"] == 2
    assert data["total_leads"] == 2
    assert data["leads_by_status"]["New"] == 1
    assert data["leads_by_status"]["ClosedWon"] == 1


def test_dashboard_recent_activities(client, auth_headers):
    for i in range(7):
        client.post("/api/activities", json={"type": "Call", "subject": f"Call {i}"}, headers=auth_headers)
    r = client.get("/api/dashboard/stats", headers=auth_headers)
    assert len(r.json()["recent_activities"]) == 5  # max 5


def test_dashboard_requires_auth(client):
    r = client.get("/api/dashboard/stats")
    assert r.status_code == 403


def test_search(client, auth_headers):
    client.post("/api/contacts", json={"name": "Searchable Person", "company": "UniqueComp"}, headers=auth_headers)
    client.post("/api/leads", json={"title": "Searchable Lead"}, headers=auth_headers)

    r = client.get("/api/search?q=Searchable", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert len(data["contacts"]) == 1
    assert len(data["leads"]) == 1


def test_search_case_insensitive(client, auth_headers):
    client.post("/api/contacts", json={"name": "John DOE"}, headers=auth_headers)
    r = client.get("/api/search?q=john", headers=auth_headers)
    assert r.json()["contacts"][0]["name"] == "John DOE"


def test_search_requires_auth(client):
    r = client.get("/api/search?q=test")
    assert r.status_code == 403
