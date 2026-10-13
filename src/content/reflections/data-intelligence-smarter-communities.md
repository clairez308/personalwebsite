---
date: "2026-05-01"
period: "September 2026"
title: "Data Intelligence for Smarter Communities: 1st place"
tag: "Five Bars 3G"
photos: ["/assets/databricks.png"]
---

This was such a super unexpected win! We just wanted to make a brand new idea with the limited data we received, and we ended up taking 1st place ($3,000) at the Data Intelligence for Smarter Communities hackathon!

It was hosted by Rogers Business, The University of British Columbia, and Databricks, and the challenge was to turn cell tower traffic data into smart community solutions focused on transit or security. We were given data from three cell tower locations, with entries for when someone connected to a tower, where they came from, and how long they stayed. To make the best use of the origin data, we assumed everyone connected to the tower would want to go home!

We focused on natural disasters and extreme weather, where people would either want to go home or stay somewhere safe. We were so grateful for insights from Professor Bhushan Gopaluni, who shared a personal example of hundreds of students stranded at UBC during a snowstorm and sleeping at the AMS Student Nest. If UBC had known how many students were stranded, resources could have been better allocated. Our research also showed that after the 2010 earthquake in Haiti, the movement of 630,000 people was tracked through anonymized cell data, which let the UN target relief supplies.

Vancouver's emergency plans assume people are at home, so we focused on four core problems:

1. No one knows who's where.
2. Getting home isn't guaranteed.
3. Aid goes out blind.
4. Responders get overwhelmed with calls.

Our team, Five Bars 3G, built [cell-safe](https://lnkd.in/gR3cTNhx), a platform for the city, transportation agencies, and emergency responders to assess the situation and take action. It helps with four things:

1. How many people are at a given location, and from which areas, is known.
2. The number of people who can't get home safely due to road or transit closures is known.
3. The resources to send to community hubs are known, by redirecting people to the closest shelters.
4. Responders have more information about the situation, which helps them assist people in need.

We focused on Waterfront Station, but the platform works in any location! We used Databricks to consolidate 8 million rows of data into a compact occupancy time series table, showing how many people are at Waterfront Station from different origin buckets. We also integrated open source datasets and APIs, including 25 community hubs in Vancouver, road closures from DriveBC, and TransLink GTFS Realtime data for transit status.

We're so grateful for the chance to build a thoughtful solution and be judged by professionals from business, transportation, and safety backgrounds. Special thanks to Raymond Chau for being super helpful and welcoming!

Explore our [website](https://lnkd.in/gR3cTNhx), [slides](https://lnkd.in/gS9ghXpH), and [code](https://lnkd.in/gwYr-xAs)!

**Key learning:** Limited data can still lead to a big idea. Start from the real-world problem and let the data shape the solution.
