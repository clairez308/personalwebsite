---
title: "Atlas"
subtitle: "Designing an AI-native operating system for venture capital, for UBC PMC's Product Heist 2025."
date: "2025-11-01"
period: "Nov 2025"
competition: "UBC PMC Product Heist 2025"
hostedBy: "Overdrive"
deliverables:
  - label: "FigJam"
  - label: "Pitch Deck"
    url: "https://canva.link/t319sqjcimc54m1"
  - label: "Clickable Prototype"
result: "3rd overall"
description: "At UBC PMC's Product Heist 2025, my team built a system that pulls together AI research, relationship mapping, and startup scoring for VC teams. I led the product thinking, from framing the problem to the clickable prototype."
featuredStats:
  - value: "3rd overall"
    label: "UBC PMC Product Heist 2025"
  - value: "40%"
    label: "of judging weight on PM thinking"
  - value: "20h → 1h"
    label: "projected time per startup evaluated"
sections:
  - type: "text"
    label: "01 / The Brief"
    heading: "Build an operating system for venture capital"
    paragraphs:
      - "Overdrive is an AI studio that builds tools for venture capital, automating sourcing, research, and relationship intelligence for funds across a network of 45,000+ investors and 11,000 funds. For Product Heist 2025, they gave student teams one brief: design a lightweight \"operating system\" that brings three things together into one product, an agentic AI assistant, a relationship-mapping system, and a startup-scoring system."
      - "The judging was weighted on purpose: 40% PM thinking, 30% UX design, 30% pitch and deck. That told me the brief cared less about how polished the screens looked and more about whether the thinking behind them actually held up."
    stats:
      - value: "40%"
        label: "PM thinking"
      - value: "30%"
        label: "UX design"
      - value: "30%"
        label: "Pitch + deck"

  - type: "text"
    label: "02 / The Problem"
    heading: "VC funds are drowning in manual work"
    paragraphs:
      - "Even the funds that call themselves data-driven are still running on manual work behind the scenes. Deal information lives across emails, PDFs, meeting notes, and spreadsheets with nothing tying it together, so analysts spend more time hunting for the right document than actually evaluating the company in it."
      - "Relationship data is just as scattered. Knowing who's worked with whom, which investors are already circling a deal, or who could make a warm intro means piecing together email threads, LinkedIn, and whatever someone happens to remember. And even when strong signals exist, things like revenue growth, user traction, or funding from respected co-investors, they're rarely tracked consistently enough to actually help prioritize a pipeline of thousands of startups."
    stats:
      - value: "~20 hrs"
        label: "spent by a VC analyst per potential investment (Forbes, 2017)"

  - type: "personas"
    label: "03 / Users"
    heading: "Two people, two failure modes"
    intro: "Framing the problem meant figuring out who actually uses a VC operating system day to day. That's an analyst working under deadline pressure, and a partner who needs to trust the output without redoing the work themselves."
    personas:
      - name: "Alex"
        role: "26 · Analyst"
        points:
          - "47 new pitch decks can land in one morning, all in different formats, and the metrics still have to get pulled out by hand."
          - "Spends more time sifting through documents than actually analyzing them."
          - "Writing a single investment memo from scratch takes 4+ hours."
          - "Never knows if the fund has a prior connection to a founder."
      - name: "James"
        role: "42 · Partner"
        points:
          - "Manages LP and founder relationships while making fast, high-conviction calls."
          - "Information is scattered across email, drives, and message threads, with no visibility into warm intro paths."
          - "Shows up to calls without full context because summaries are inconsistent."

  - type: "signals"
    label: "04 / Prioritization"
    heading: "Not every data point is worth tracking"
    intro: "The brief asked us to help VCs score startups systematically. Instead of building a model with twenty loosely justified inputs, we narrowed it down to three signals we could actually defend, each one backed by outside research instead of just a gut feeling."
    items:
      - title: "Revenue growth"
        description: "The strongest indicator of early product-market fit: customers voting with money."
        source: "Sourced by Y Combinator"
      - title: "Total users acquired"
        description: "Captures adoption momentum before revenue fully develops."
        source: "Sourced by Finro Financial Consulting"
      - title: "Founders' inter-relationships"
        description: "The network layer: credibility, access, and warm paths that often determine whether a company can scale."
        source: "Sourced by Strategic Direction, Vol. 26"

  - type: "solution"
    label: "05 / Solution"
    heading: "One system, three connected layers"
    intro: "Atlas ties the agentic AI assistant, the relationship map, and the scoring system into a single pipeline instead of three disconnected tools. It pulls from LinkedIn, GitHub, Google Scholar, and pitch materials to keep every layer current."
    systems:
      - title: "Agentic AI System"
        description: "Automatically parses pitch decks, extracts metrics, and pre-fills investment memos so analysts start from a draft, not a blank page."
      - title: "Relationship Mapping"
        description: "A network view of who's worked together, who sits on which board, and which warm paths could help win a deal."
      - title: "Startup Scoring"
        description: "Ranks startups by revenue growth, user growth, and founder network strength, sorted into High / Median / Low potential."
    views:
      - heading: "From the desktop of an analyst"
        items:
          - "AI-powered analysis"
          - "Report generation & editing"
          - "One-click sharing to partners"
          - "Relationship maps"
          - "Notes & context layer"
      - heading: "From the laptop of a partner"
        items:
          - "Report review"
          - "Founder signal analysis"
          - "Dedicated relationship-map tab"
          - "Live connection updates"

  - type: "roadmap"
    label: "06 / Prioritization"
    heading: "Choosing features intentionally"
    intro: "A system that tries to do everything on day one does nothing well. We split the roadmap into what had to exist to prove the concept, what could wait, and what depended on integrations we hadn't earned the right to build yet."
    core:
      heading: "Must Have / MVP Core"
      items:
        - "Analyst dashboard"
        - "AI pitch-deck parser & summarizer"
        - "Basic scoring (revenue & users)"
        - "Relationship map"
        - "Report generator"
        - "Partner view"
    later:
      - heading: "Phase 2 (Months 4 to 6)"
        items:
          - "Email + calendar auto-import"
          - "LinkedIn integration for network data"
          - "Advanced AI scoring with custom weights"
          - "Real-time collaboration on reports"
      - heading: "Future (Months 7 to 12)"
        items:
          - "Portfolio company tracking"
          - "Full version history"
          - "12-month revenue forecasting"

  - type: "compare"
    label: "07 / Positioning"
    heading: "Why an integrated system wins"
    intro: "Point tools already exist for pieces of this problem: relationship CRMs, deck parsers, scoring bots. What's missing is the connective tissue, a system where a relationship signal changes a score, and a score changes what an analyst sees first. We benchmarked Atlas against existing point solutions on that basis."
    columns: ["Point Solutions", "Atlas"]
    rows:
      - capability: "Document AI processing"
        left: "partial"
        right: "yes"
      - capability: "Relationship mapping"
        left: "partial"
        right: "yes"
      - capability: "Startup scoring"
        left: "partial"
        right: "yes"
      - capability: "Real-time updates"
        left: "partial"
        right: "yes"
      - capability: "Analyst-first design"
        left: "no"
        right: "yes"
      - capability: "Network-influenced scoring"
        left: "no"
        right: "yes"

  - type: "stats"
    label: "08 / Impact"
    heading: "20 hours to 1, per startup"
    intro: "None of this replaces analyst judgment. It just removes the grunt work standing in front of it."
    stats:
      - value: "20h → 1h"
        label: "projected time per startup evaluated"
      - value: "3–4 → 50+"
        label: "projected investment reports per analyst, per week"
    quote: "Atlas doesn't replace analyst judgment. It amplifies it by removing the grunt work."

  - type: "text"
    label: "09 / Result"
    heading: "3rd overall, and a lesson in weighting"
    paragraphs:
      - "Atlas placed 3rd overall at UBC PMC's Product Heist 2025, judged across PM thinking, UX design, and pitch delivery."
      - "The rubric weighted PM thinking almost as heavily as UX and pitch combined. That stuck with me. The strongest entry usually isn't the one with the most polished screens, it's the one with the clearest reasoning for why each screen exists. Prioritize hard, be able to defend every feature, and let the interface follow the decision instead of the other way around."
    image:
      src: "/assets/atlas-team.jpg"
      alt: "The Atlas team holding up Product Heist third place certificates"
      caption: "Us right after finding out we placed 3rd."
---
