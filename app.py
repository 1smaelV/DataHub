#!/usr/bin/env python3
"""
DataHub Internal Portal - Databricks App Entrypoint
Serves the modular documentation, accelerators, and reference portal on Databricks Apps.
"""

import os
import time
import logging

from flask import Flask, render_template, jsonify, request
from databricks import sql
from databricks.sdk.core import Config

app = Flask(__name__, static_folder="static", template_folder="templates")
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("datahub-portal")

# Cache-busting: a new value on every app start (i.e. every deployment) is
# appended to static asset URLs so browsers always fetch the latest JS/CSS.
ASSET_VERSION = os.environ.get("ASSET_VERSION") or str(int(time.time()))


@app.context_processor
def inject_asset_version():
    return {"asset_v": ASSET_VERSION}


@app.after_request
def no_cache_html(response):
    # Always revalidate the HTML shell so new deployments show up immediately
    if response.mimetype == "text/html":
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response

# Unity Catalog schema holding the certification data
CERT_SCHEMA = os.environ.get("CERT_SCHEMA", "sandbox_shared.cnx_dbx_db")

LEADERBOARD_SQL = f"""
SELECT
  e.employee_id,
  e.name                         AS employee_name,
  c.name                         AS certification_name,
  CAST(ec.date_achieved AS DATE) AS date_achieved,
  CAST(ec.expiry_date   AS DATE) AS expiry_date,
  COUNT(*) OVER (PARTITION BY e.employee_id) AS cert_count
FROM {CERT_SCHEMA}.employees e
JOIN {CERT_SCHEMA}.emp_cert ec      ON e.employee_id = ec.employee_id
JOIN {CERT_SCHEMA}.certifications c ON ec.certification_id = c.certification_id
ORDER BY cert_count DESC, e.name, ec.date_achieved DESC
"""


class NotSignedIn(Exception):
    pass


def run_query(statement):
    """Run a SQL statement on the configured warehouse as the signed-in user.

    Databricks Apps forwards the viewer's OAuth token in the
    X-Forwarded-Access-Token header when the app has the `sql` user API scope.
    """
    user_token = request.headers.get("X-Forwarded-Access-Token")
    if not user_token:
        raise NotSignedIn(
            "No user token was forwarded. Enable user authorization with the 'sql' scope for this app."
        )
    host = Config().host.replace("https://", "").rstrip("/")
    warehouse_id = os.environ["DATABRICKS_WAREHOUSE_ID"]
    with sql.connect(
        server_hostname=host,
        http_path=f"/sql/1.0/warehouses/{warehouse_id}",
        access_token=user_token,
    ) as conn:
        with conn.cursor() as cur:
            cur.execute(statement)
            cols = [d[0] for d in cur.description]
            return [dict(zip(cols, row)) for row in cur.fetchall()]

# Modules & Sections metadata (English IDs & Lucide Icon names)
PAGES = [
    {"id": "home", "title": "Home", "icon": "home", "category": "Main"},
    {"id": "what-is", "title": "What is Databricks?", "icon": "book-open", "category": "Main"},
    {"id": "presales", "title": "Pre-Sales", "icon": "target", "category": "Sales Cycle"},
    {"id": "solutioning", "title": "Solutioning", "icon": "puzzle", "category": "Sales Cycle"},
    {"id": "design", "title": "Design", "icon": "pen-tool", "category": "Sales Cycle"},
    {"id": "delivery", "title": "Delivery", "icon": "rocket", "category": "Sales Cycle"},
    {"id": "framework", "title": "Architecture", "icon": "layers", "category": "Framework"},
    {"id": "usage", "title": "How to Use", "icon": "settings", "category": "Framework"},
    {"id": "projects", "title": "Active Projects", "icon": "folder-git-2", "category": "Framework"},
    {"id": "training", "title": "Training", "icon": "graduation-cap", "category": "Enablement"},
    {"id": "pov", "title": "POV", "icon": "flask-conical", "category": "Enablement"},
    {"id": "demo", "title": "Demo", "icon": "play-circle", "category": "Enablement"},
    {"id": "environments", "title": "Environments", "icon": "server", "category": "Enablement"},
    {"id": "certifications", "title": "Certifications", "icon": "award", "category": "Enablement"},
    {"id": "faq", "title": "FAQ", "icon": "help-circle", "category": "Enablement"},
    {"id": "glossary", "title": "Glossary", "icon": "library", "category": "Reference"},
    {"id": "bestpractices", "title": "Best Practices", "icon": "check-circle-2", "category": "Reference"},
    {"id": "quickref", "title": "Quick Reference", "icon": "terminal", "category": "Reference"},
    {"id": "about", "title": "About", "icon": "info", "category": "About"}
]

@app.route("/")
def index():
    return render_template("index.html", pages=PAGES)

@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "app": "data-hub",
        "version": "3.0"
    })

@app.route("/api/info")
def app_info():
    return jsonify({
        "app_name": "DataHub Internal Portal",
        "version": "3.0",
        "environment": os.environ.get("DATABRICKS_RUNTIME_ENVIRONMENT", "production" if os.environ.get("DATABRICKS_APP_PORT") else "development"),
        "total_modules": len(PAGES),
        "creator": "ismael.villegasdiaz@concentrix.com"
    })

@app.route("/api/pages")
def list_pages():
    return jsonify(PAGES)

@app.route("/api/cert-leaderboard")
def cert_leaderboard():
    try:
        rows = run_query(LEADERBOARD_SQL)
        for r in rows:
            for k in ("date_achieved", "expiry_date"):
                if r.get(k) is not None:
                    r[k] = r[k].isoformat()
        return jsonify({"rows": rows})
    except NotSignedIn as exc:
        return jsonify({"error": str(exc)}), 401
    except Exception as exc:  # surface a clean error to the UI
        log.exception("Failed to load certification leaderboard")
        return jsonify({"error": str(exc)}), 500

if __name__ == "__main__":
    # Databricks Apps sets DATABRICKS_APP_PORT in the environment
    port = int(os.environ.get("DATABRICKS_APP_PORT", 8000))
    print(f"[*] Starting DataHub Internal Portal on 0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
