from fastapi.testclient import TestClient
from api.main import app, load_resources

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()

def test_metrics():
    response = client.get("/api/v1/metrics")
    if response.status_code == 200:
        data = response.json()
        assert "base_rate" in data
        assert "selected_model" in data
    else:
        assert response.status_code == 404

def test_watchlist():
    response = client.get("/api/v1/watchlist")
    if response.status_code == 200:
        data = response.json()
        assert "summary" in data
        assert "items" in data
        assert len(data["items"]) > 0
    else:
        assert response.status_code == 404

def test_whatif():
    # Force load resources for the test
    load_resources()
    
    # Try a whatif post
    # Using an employee ID we assume exists or at least we get 404/422 correctly
    # Let's get the first employee from /api/v1/employees
    res_emp = client.get("/api/v1/employees")
    if res_emp.status_code == 200 and len(res_emp.json()) > 0:
        emp_id = res_emp.json()[0]['EmployeeNumber']
        
        payload = {
            "employee_id": emp_id,
            "changes": {"OverTime": "No"}
        }
        res_whatif = client.post("/api/v1/what-if", json=payload)
        assert res_whatif.status_code == 200
        data = res_whatif.json()
        assert "prob_before" in data
        assert "prob_after" in data
        assert "delta_pct" in data
        
        # Test invalid input
        bad_payload = {
            "employee_id": emp_id,
            "changes": {"InvalidFeature": 123}
        }
        res_bad = client.post("/api/v1/what-if", json=bad_payload)
        assert res_bad.status_code == 422

def test_analytics_expected_loss():
    res = client.get("/api/v1/analytics/expected-loss")
    if res.status_code == 200:
        data = res.json()
        assert "items" in data
        assert "assumptions" in data
        assert "overlap_with_risk_top50" in data
    else:
        assert res.status_code == 404

def test_analytics_fairness():
    res = client.get("/api/v1/analytics/fairness")
    if res.status_code == 200:
        data = res.json()
        assert "groups" in data
        assert "model_comparison" in data
    else:
        assert res.status_code == 404

def test_analytics_hotspots():
    res = client.get("/api/v1/analytics/hotspots")
    if res.status_code == 200:
        data = res.json()
        assert "departments" in data
        assert "roles" in data
    else:
        assert res.status_code == 404

def test_analytics_action_drafts():
    res = client.get("/api/v1/analytics/action-drafts")
    if res.status_code == 200:
        data = res.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "employee_id" in data[0]
            assert "status" in data[0]
            assert data[0]["status"] == "PENDING_APPROVAL"
    else:
        assert res.status_code == 404
