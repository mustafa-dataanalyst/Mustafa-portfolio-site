/* =========================================================================
   MZ Site Content Store
   Single source of truth for every editable piece of the website.
   Persists to localStorage so admin edits instantly reflect on the live
   site (in any open tab) and survive reloads on this browser/device.
   ========================================================================= */

(function (global) {
  const CONTENT_KEY = 'mz_site_content_v1';
  const AUTH_KEY = 'mz_admin_auth_v1';
  const SESSION_KEY = 'mz_admin_session_v1';
  const EVENT_NAME = 'mz-content-updated';

  const DEFAULT_CONTENT = {
    theme: 'midnight',

    social: {
      email: 'mustafa.zafar.jp@gmail.com',
      linkedin: 'https://www.linkedin.com/in//mustafa-gull',
      github: 'https://github.com/mustafa-dataanalyst'
    },

    text: {
      home: {
        heroEyebrow: 'Data Analyst',
        heroName: 'Mustafa Zafar',
        heroRole: 'Python · SQL · Power BI',
        heroTagline: 'Turning raw data into decisions that matter.',
        heroCtaPrimary: 'View My Work',
        heroCtaSecondary: 'Get In Touch',
        statProjects: '5',
        statProblems: '90',
        statTools: '10',
        ctaHeading: "Got data? Let's find what it's telling you.",
        ctaSubtext: "Whether it's a dashboard, a reporting system, or a one-off analysis I'm happy to talk through it."
      },
      about: {
        heroHeading: 'From spotting patterns on the sales floor to building the dashboards that explain them.',
        story1: "I started learning data analytics as a self-taught journey working through SQL fundamentals, Python, and Power BI while building a career across customer service, sales, and CRM operations.",
        story2: "Over time I realized that the patterns I was already spotting in customer behavior and sales performance were exactly what data analysis formalizes. So I turned it into a focused career path, one query and one dashboard at a time.",
        story3: "What makes me different is that I don't just build dashboards I connect business operations experience with technical analysis, so the insights I deliver are grounded in how the business actually runs, not just abstract numbers.",
        missionText: 'To help businesses turn raw, messy data into clear decisions using the same analytical thinking that comes from having worked hands-on in CRM, sales, and customer operations.'
      },
      services: {
        heroHeading: 'Practical data work, priced clearly.',
        heroSubtext: "From a single SQL deep-dive to ongoing CRM support here's how I can help, and what it starts at."
      },
      portfolio: {
        heroHeading: 'A closer look at how I turn data into decisions.',
        heroSubtext: "Filter by the kind of work you're interested in, or browse everything below. Click any project for a closer look."
      },
      awards: {
        heroHeading: 'Milestones that mark real, verifiable progress.',
        heroSubtext: 'A few markers along the way not just credentials, but proof of hands-on, real-world problem solving.'
      },
      contact: {
        heroHeading: "Let's talk about your data.",
        heroSubtext: "Have a project, a messy dataset, or just a question? Send a message and I'll get back to you."
      }
    },

    images: {
      headshot: 'assets/img/profile.jpg'
    },

    services: [
      {
        id: 'svc-1',
        icon: 'chart',
        title: 'Data Analysis & SQL Reporting',
        desc: 'Full data cleaning, exploratory analysis, and SQL-based business problem solving using Python and PostgreSQL.',
        price: '119',
        per: '/ project',
        tags: ['Python', 'PostgreSQL', 'SQL']
      },
      {
        id: 'svc-2',
        icon: 'dashboard',
        title: 'Power BI Dashboard Development',
        desc: 'Interactive dashboards with DAX measures, KPI tracking, and dynamic filtering built for business reporting.',
        price: '149',
        per: '/ dashboard',
        tags: ['Power BI', 'DAX', 'KPI Tracking']
      },
      {
        id: 'svc-3',
        icon: 'excel',
        title: 'Excel Business Reporting',
        desc: 'Data cleaning, pivot tables, and interactive dashboards for business reporting and decision making.',
        price: '99',
        per: '/ project',
        tags: ['Excel', 'Pivot Tables']
      },
      {
        id: 'svc-4',
        icon: 'crm',
        title: 'CRM & Sales Operations Support',
        desc: 'Complete CRM cleanup, lead tracking, sales pipeline reporting, and workflow automation, on a monthly basis.',
        price: '199',
        per: '/ month',
        tags: ['CRM', 'Pipeline Reporting', 'Automation']
      }
    ],

    awards: [
      {
        id: 'aw-1',
        icon: 'medal',
        year: '2026',
        context: 'Forage · Deloitte Australia',
        title: 'Deloitte Data Analytics Virtual Internship',
        desc: "Completed via Forage, this program recognized hands-on experience in data cleaning, analysis, and business problem solving using Deloitte's industry-standard methodology.",
        why: "It's proof that my analytical process holds up to a formal, industry-recognized standard not just self-taught intuition."
      },
      {
        id: 'aw-2',
        icon: 'chart',
        year: '2026',
        context: 'Self-Directed Project · PostgreSQL',
        title: '15+ Business Problems Solved',
        desc: "A self-directed SQL project analyzing Netflix's global content catalog, solving medium-to-advanced real-world business questions through PostgreSQL.",
        why: 'It shows I can go beyond textbook queries and use SQL to actually answer the kind of questions a business would ask.'
      },
      {
        id: 'aw-3',
        icon: 'dashboard',
        year: '2026',
        context: 'Independent Portfolio · GitHub',
        title: 'Multi-Tool Analytics Portfolio',
        desc: 'Independently built and documented 4+ end-to-end analytics projects spanning Python, SQL, Power BI, and Excel — published and version-controlled on GitHub.',
        why: 'It demonstrates range across the full analytics toolkit, and a habit of documenting and version-controlling work the way a professional would.'
      }
    ],

    portfolio: [
      {
        id: 'pf-1',
        featured: true,
        category: 'python-sql',
        categoryLabel: 'Python & SQL Analysis',
        title: 'Customer Shopping Behavior Analysis',
        shortDesc: 'Segmented retail customers and surfaced purchasing trends from raw transaction data.',
        fullDesc: 'Explored transaction-level retail data to uncover purchasing patterns, customer segments, and seasonal trends. Cleaned and modeled the dataset in Python, ran exploratory analysis in PostgreSQL, and built a Power BI summary layer for stakeholders to explore the findings interactively.',
        tools: ['Python', 'PostgreSQL', 'Power BI'],
        image: 'assets/img/customer.jpg'
      },
      {
        id: 'pf-2',
        featured: true,
        category: 'python-sql',
        categoryLabel: 'Python & SQL Analysis',
        title: 'Netflix Content Analysis',
        shortDesc: "Queried Netflix's content catalog in SQL to reveal genre and release-trend patterns.",
        fullDesc: "Queried and analyzed Netflix's global content catalog in PostgreSQL to understand genre distribution, release trends over time, and content mix by country. Wrote a full set of SQL queries to answer specific business questions about catalog strategy.",
        tools: ['PostgreSQL', 'SQL'],
        image: 'assets/img/netflix.jpg'
      },
      {
        id: 'pf-3',
        featured: true,
        category: 'powerbi-dax',
        categoryLabel: 'Power BI & DAX Dashboards',
        title: 'Data Professional Survey Breakdown',
        shortDesc: 'Built an interactive Power BI report breaking down global data professional survey results.',
        fullDesc: 'Transformed raw survey responses from data professionals worldwide into a fully interactive Power BI report. Used Power Query for data shaping and wrote custom DAX measures to break down salary, tools, and satisfaction trends by role, region, and experience level.',
        tools: ['Power BI', 'Power Query', 'DAX'],
        image: 'assets/img/powerbi.jpg'
      },
      {
        id: 'pf-4',
        featured: true,
        category: 'excel-reporting',
        categoryLabel: 'Excel & Business Reporting',
        title: 'Bike Sales Dashboard',
        shortDesc: 'Created a dynamic Excel Pivot Table dashboard for slicing bike sales performance.',
        fullDesc: 'Built a fully dynamic Excel sales dashboard for a bike retailer using Pivot Tables and Pivot Charts, allowing stakeholders to slice sales performance by region, product line, and time period without touching a single formula.',
        tools: ['Excel', 'Pivot Tables'],
        image: 'assets/img/excel.jpg'
      }
    ]
  };

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function getContent() {
    try {
      const raw = localStorage.getItem(CONTENT_KEY);
      if (!raw) return clone(DEFAULT_CONTENT);
      const parsed = JSON.parse(raw);
      // shallow-merge with defaults so newly added fields never break old saves
      return Object.assign(clone(DEFAULT_CONTENT), parsed, {
        text: Object.assign(clone(DEFAULT_CONTENT.text), parsed.text || {}),
        social: Object.assign(clone(DEFAULT_CONTENT.social), parsed.social || {}),
        images: Object.assign(clone(DEFAULT_CONTENT.images), parsed.images || {})
      });
    } catch (e) {
      console.error('Content store read error', e);
      return clone(DEFAULT_CONTENT);
    }
  }

  function saveContent(content) {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
    // notify listeners in THIS tab (storage event only fires in other tabs)
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: content }));
  }

  function resetContent() {
    localStorage.removeItem(CONTENT_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: getContent() }));
  }

  function onContentChange(callback) {
    window.addEventListener(EVENT_NAME, (e) => callback(e.detail));
    window.addEventListener('storage', (e) => {
      if (e.key === CONTENT_KEY) callback(getContent());
    });
  }

  // ---------------- Auth ----------------
  const DEFAULT_AUTH = { username: 'admin', password: 'Admin@123' };

  function getAuth() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : clone(DEFAULT_AUTH);
    } catch (e) {
      return clone(DEFAULT_AUTH);
    }
  }

  function saveAuth(auth) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  }

  function attemptLogin(username, password) {
    const auth = getAuth();
    if (username === auth.username && password === auth.password) {
      sessionStorage.setItem(SESSION_KEY, '1');
      return true;
    }
    return false;
  }

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  global.MZStore = {
    CONTENT_KEY, AUTH_KEY,
    getContent, saveContent, resetContent, onContentChange,
    getAuth, saveAuth, attemptLogin, isLoggedIn, logout,
    DEFAULT_CONTENT
  };
})(window);
