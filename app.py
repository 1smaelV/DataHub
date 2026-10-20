#!/usr/bin/env python3
"""
DataHub Internal Portal - Databricks App Entrypoint
Serves the modular documentation, accelerators, and reference portal on Databricks Apps.
"""

import os
from flask import Flask, render_template, jsonify

app = Flask(__name__, static_folder="static", template_folder="templates")

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

if __name__ == "__main__":
    # Databricks Apps sets DATABRICKS_APP_PORT in the environment
    port = int(os.environ.get("DATABRICKS_APP_PORT", 8000))
    print(f"[*] Starting DataHub Internal Portal on 0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
