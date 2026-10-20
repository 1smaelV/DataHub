# DataHub Internal Portal — Databricks App

Internal knowledge portal, technical architecture, framework, and acceleration platform for Databricks engineering, pre-sales, and delivery teams.

---

## 📁 Modular Project Structure

```text
├── app.yaml                 # Deployment manifest for Databricks Apps
├── requirements.txt         # Python dependencies (Flask)
├── app.py                   # Web server entrypoint (binds dynamically to DATABRICKS_APP_PORT)
├── .gitignore               # Ignored files for version control
├── README.md                # Project documentation
│
├── static/
│   ├── css/
│   │   ├── theme.css        # CSS variables, color palette, typography (Sora + Mono), and dark/light modes
│   │   ├── layout.css       # Sidebar, topbar, background grid, and responsive breakpoints
│   │   └── components.css   # Cards, tables, code blocks, badges, alerts, and accordions
│   └── js/
│       ├── theme.js         # Dark / Light theme switcher with localStorage persistence
│       ├── navigation.js    # SPA client-side router (showPage) with URL hash (#) support
│       ├── components.js    # Real-time search filter, interactive FAQ accordion, and copy-to-clipboard
│       └── app.js           # Application bootstrap and initialization
│
└── templates/
    ├── base.html            # Master layout template with modular asset imports
    ├── index.html           # Main view assembling all partials
    ├── components/
    │   ├── sidebar.html     # Sidebar navigation menu across all portal sections
    │   └── topbar.html      # Header bar with search input, theme toggle, and user profile badge
    └── pages/               # Modular standalone page templates:
        ├── home.html            # Home view with key metrics, quick links, and platform overview
        ├── what_is.html         # "What is Databricks?" and Lakehouse architecture foundation
        ├── presales.html        # Pre-sales playbooks, customer engagement decks, and ROI models
        ├── solutioning.html     # Solution design patterns and cluster sizing calculators
        ├── design.html          # Technical design standards and Medallion architecture blueprints
        ├── delivery.html        # Delivery standards, sprint ceremonies, and go-live checklists
        ├── framework.html       # Internal framework architecture and data pipelines
        ├── usage.html           # Practical usage guide for team members
        ├── projects.html        # Active projects, client use cases, and delivery tracker
        ├── training.html        # Structured learning paths and certification roadmaps
        ├── pov.html             # Proof of Value (POV) validation methodology
        ├── demo.html            # Demo environments, presentation scripts, and guidelines
        ├── environments.html    # Workspace configurations, access tiers, and governance policies
        ├── certifications.html  # Official certifications, prep material, and CoE voucher program
        ├── faq.html             # Interactive FAQ with categorized accordions
        ├── glossary.html        # Technical glossary and searchable terminology index
        ├── bestpractices.html   # Engineering best practices (Do's and Don'ts)
        ├── quickref.html        # Everyday commands, PySpark / SQL snippets, and cheatsheets
        └── about.html           # Platform specifications, CoE governance, and team contacts
```

---

## 🚀 Local Development

To run and preview the application locally:

```powershell
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the local server
python app.py
```

Open your browser and navigate to: [http://localhost:8000](http://localhost:8000)

---

## ☁️ Deployment to Databricks Apps

With your Databricks CLI authenticated to the workspace (`https://dbc-c5a100bc-ae34.cloud.databricks.com`), follow these steps:

### 1. Sync Source Files into Databricks

In a terminal window within this folder (`c:\Users\licis\Downloads\TEST`):

```powershell
databricks sync --watch . /Workspace/Users/ismael.villegasdiaz@concentrix.com/data-hub
```
*This command runs in the background and continuously syncs any local file changes to your remote Databricks workspace folder in real time.*

### 2. Deploy the Application

In another terminal window:

```powershell
databricks apps deploy data-hub --source-code-path /Workspace/Users/ismael.villegasdiaz@concentrix.com/data-hub
```

### 3. Access Your Deployed App

Once the deployment completes, your application will be live at:
👉 **[https://data-hub-2207020850934507.aws.databricksapps.com](https://data-hub-2207020850934507.aws.databricksapps.com)**
