export const articles = [
  {
    slug: 'aeo-vs-geo-service-businesses',
    category: 'AEO and GEO',
    title: 'AEO vs GEO: What Service Businesses Actually Need',
    description: 'What AEO and GEO mean in plain English, how each can help a service business get found, and what to improve first.',
    directAnswer: 'AEO and GEO are two technical names for helping a business become a useful answer. AEO focuses on clear answers to specific questions. GEO focuses on helping generative search and AI tools understand, verify, and use those answers in a broader response. Both depend on a strong website, useful content, consistent facts, and credible proof.',
    sections: [
      {
        id: 'definitions',
        title: 'AEO and GEO in plain language',
        html: `<p>Answer engine optimization, or AEO, focuses on making information easy to retrieve for direct answers. A well designed answer page names the question, responds early, explains conditions, and supports the response with useful detail. It uses descriptive headings, semantic HTML, explicit definitions, lists, tables, and links when those formats help a person understand the subject.</p>
        <p>Generative engine optimization, or GEO, considers how generative search and assistant systems assemble a response from many sources. The work still needs clear answer passages, but it also emphasizes entity consistency, corroboration, author identity, source reputation, and a connected body of material that can support more complex questions.</p>
        <table tabindex="0" aria-label="AEO and GEO comparison"><thead><tr><th>Discipline</th><th>Primary emphasis</th><th>Typical website work</th></tr></thead><tbody>
          <tr><td>AEO</td><td>Direct, retrievable answers</td><td>Question maps, concise summaries, semantic structure, supporting detail, and accurate schema</td></tr>
          <tr><td>GEO</td><td>Use in generated responses</td><td>Entities, corroboration, topical depth, authorship, evidence, and consistent facts across public sources</td></tr>
          <tr><td>Technical SEO</td><td>Access, indexing, and quality signals</td><td>Status codes, canonicals, sitemaps, internal links, rendering, mobile experience, and performance</td></tr>
        </tbody></table>`,
      },
      {
        id: 'shared-foundation',
        title: 'The shared foundation matters more than the label',
        html: `<p>Google says that the same foundational SEO practices apply to its AI features. A business does not need secret markup or a separate machine only version of every page. It needs content that can be crawled, indexed, understood, and found useful. Important text should be available in the rendered page, internal links should connect related information, and technical controls should not accidentally block retrieval.</p>
        <p>The foundation also includes page experience. A service page that loads poorly, shifts around, hides key information, or fails on mobile is weaker for people even if its copy contains the right phrases. AEO and GEO should improve the public site, not create a parallel layer of awkward passages written only for a bot.</p>
        <blockquote>Optimize the answer by improving the page that carries it. Do not separate machine clarity from human clarity.</blockquote>`,
      },
      {
        id: 'service-business-needs',
        title: 'What a service business actually needs',
        html: `<p>Most service businesses need a small number of strong, interconnected page types before they need a large publishing operation. The homepage establishes the company and its primary offer. Service pages explain individual solutions. Location pages describe real geographic availability. About and team pages establish who is responsible. Case studies or project pages show how the work happens. An insights library answers important questions that do not fit on a sales page.</p>
        <p>Each page should have a distinct job. If the same generic paragraph is repeated across many city pages, there is little new value to retrieve. If every article covers a broad keyword but never states the company\'s experience, sources, or process, it may add volume without adding confidence.</p>
        <ul>
          <li>A clear organization name, contact path, service area, and ownership identity.</li>
          <li>One canonical page for each meaningful service or topic.</li>
          <li>Direct responses to questions that affect a buying decision.</li>
          <li>Visible evidence, dates, qualifications, examples, and limitations where relevant.</li>
          <li>Contextual links that show how services, people, places, and supporting guides relate.</li>
        </ul>`,
      },
      {
        id: 'implementation',
        title: 'A practical implementation sequence',
        html: `<ol>
          <li><strong>Collect real questions.</strong> Use sales conversations, support messages, Search Console queries, search results, and customer language. Separate questions about fit, process, price factors, timing, risk, and alternatives.</li>
          <li><strong>Assign each question to a page.</strong> Choose the page that has enough authority and context to answer it. Avoid creating a new article when a service page should own the answer.</li>
          <li><strong>Write the direct response.</strong> Answer the question near the relevant heading, then explain the conditions, decision factors, and next step.</li>
          <li><strong>Add evidence.</strong> Link to primary sources, state dates, identify the author, describe the process, and include real examples that the business is allowed to publish.</li>
          <li><strong>Connect the entity model.</strong> Use consistent names for the company, services, locations, people, products, and credentials. Link the pages that establish those relationships.</li>
          <li><strong>Verify access and output.</strong> Check response codes, canonicals, mobile rendering, structured data, robots controls, sitemap entries, and the actual HTML delivered by the site.</li>
        </ol>
        <p>This sequence is intentionally ordinary. It creates durable website value even when a particular AI search interface changes.</p>`,
      },
      {
        id: 'schema-and-crawlers',
        title: 'Schema and crawler controls have narrow jobs',
        html: `<p>Structured data can make page meaning more explicit when it accurately represents visible content. Organization markup can identify the business. Article markup can identify a guide, its author, and publication dates. Breadcrumb markup can describe the page\'s location in the site. Schema cannot turn an unsupported statement into a trusted fact, and it does not guarantee a search feature.</p>
        <p>Robots controls determine whether named crawlers are allowed to fetch a site. Search products use different user agents and policies, so the business should make an intentional choice. OpenAI documents OAI-SearchBot for ChatGPT search and separates it from GPTBot, which is associated with model training. Perplexity also publishes crawler information. Allowing discovery does not guarantee a citation, and blocking one crawler does not remove a URL from every data source.</p>`,
      },
      {
        id: 'measurement',
        title: 'Measure behavior and business value, not a made up score',
        html: `<p>There is no universal AEO or GEO score that proves a business is visible. Useful measurement combines several imperfect signals: whether important pages are indexed, whether priority questions show relevant impressions and visits, whether AI features send traffic, whether the company is cited in a defined observation set, and whether those visitors take qualified actions.</p>
        <p>Google now provides a Search Console view for some generative AI performance. That reporting should be read alongside ordinary query and page performance, analytics, form quality, calls, and CRM outcomes. A citation observation is a timestamped sample, not a permanent rank. Record the query, market, date, interface, cited URL, and result before drawing a conclusion.</p>`,
      },
      {
        id: 'decision',
        title: 'The decision rule',
        html: `<p>If a proposed AEO tactic makes the page more useful, easier to access, clearer about its subject, and better supported, it is probably worth testing. If it depends on hidden text, repeated filler, fake author profiles, unverified schema, or a promised citation, it is not a durable strategy.</p>
        <p>Service businesses do not need to choose between AEO and GEO as competing packages. They need an information system that answers real customer questions, expresses the business consistently, and gives people and machines enough evidence to understand what is true.</p>`,
      },
    ],
    sources: [
      { title: 'AI features and your website', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/appearance/ai-features', note: 'Google guidance on appearing in AI search features.' },
      { title: 'AI optimization guide', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/fundamentals/ai-optimization-guide', note: 'Current guidance connecting AI visibility to foundational SEO.' },
      { title: 'Publishers and developers FAQ', organization: 'OpenAI', url: 'https://help.openai.com/en/articles/12627856-publishers-and-developers-faq', note: 'Official explanation of OAI-SearchBot and GPTBot controls.' },
      { title: 'Perplexity crawlers', organization: 'Perplexity', url: 'https://docs.perplexity.ai/docs/resources/perplexity-crawlers', note: 'Official crawler names and access guidance.' },
    ],
    related: [
      ['/aeo-geo/', 'AEO and GEO services'],
      ['/insights/google-ai-overviews-service-businesses/', 'Optimize for Google AI Overviews'],
      ['/insights/measure-ai-search-visibility/', 'Measure AI search visibility'],
    ],
  },
  {
    slug: 'google-ai-overviews-service-businesses',
    category: 'Google AI Overviews',
    title: 'How to Optimize a Service Business Website for Google AI Overviews',
    description: 'How to make a service business website easier for Google to understand and use in AI Overviews, without promising placement.',
    directAnswer: 'To give a service business a better chance of appearing in Google AI Overviews, publish pages Google can read, answer real customer questions clearly, support important claims, connect related services, and make the mobile experience dependable. Follow ordinary Google Search requirements. There is no special tag or guaranteed placement method.',
    sections: [
      {
        id: 'what-overviews-are',
        title: 'What optimization can and cannot control',
        html: `<p>Google AI Overviews generate a response for some searches and link to supporting web sources. The exact presentation, source selection, and triggering queries can change. A website owner can improve access and content quality, but cannot require Google to index a page, show an overview, or cite a particular URL.</p>
        <p>This distinction matters because a screenshot is not a guarantee. It documents one result at one time. A responsible optimization plan focuses on public assets the business controls: the page, its technical delivery, its evidence, its connections to other pages, and the measurement process used after publication.</p>`,
      },
      {
        id: 'crawlable-html',
        title: 'Put important information in crawlable HTML',
        html: `<p>Google renders JavaScript, but rendering adds processing and can introduce failure points. A React site should not require a crawler to execute a complex client application before any meaningful service content exists. Static generation, server rendering, or pre-rendering can place headings, paragraphs, links, and metadata in the initial HTML.</p>
        <p>Retrieve the page as a fresh visitor and inspect the source delivered by the server. Confirm that the title, description, canonical, main heading, answer content, and internal links are present or render reliably. Important pages should return a successful status, remain available to Googlebot, and appear in an XML sitemap with absolute canonical URLs.</p>
        <ul>
          <li>Use stable, descriptive URLs.</li>
          <li>Return the right status code for live, redirected, missing, and removed pages.</li>
          <li>Avoid accidentally blocking CSS, JavaScript, images, or essential routes.</li>
          <li>Keep one preferred canonical for substantially similar content.</li>
          <li>Link important pages through crawlable anchor elements.</li>
        </ul>`,
      },
      {
        id: 'question-pages',
        title: 'Build pages around decisions, not isolated keywords',
        html: `<p>A service business should begin with the questions that change a customer decision. Who is the service for? What problem does it solve? What does the process involve? Which factors affect timing or price? What should the customer prepare? What are the limits? Which alternatives should be considered?</p>
        <p>Assign each question to the most appropriate page. A service page can own questions about scope and process. A location page can explain real availability and local conditions. A case study can document the sequence and result of a specific project. An article can explore a complex educational question with sources. This ownership prevents many shallow pages from competing with one another.</p>
        <div class="callout"><strong>Answer first, then qualify</strong>Place a concise response near the relevant heading. Follow it with the conditions, examples, evidence, and next step a person needs to use the answer responsibly.</div>`,
      },
      {
        id: 'evidence',
        title: 'Make important claims checkable',
        html: `<p>People and search systems need a way to evaluate statements. Identify the author or responsible organization. Show publication and modification dates when freshness matters. Link regulatory, technical, or statistical claims to the original source. Describe the company\'s real process instead of repeating category language that could describe any competitor.</p>
        <p>First party experience is valuable when it is specific and permitted. A project page can show the initial constraint, work completed, artifacts, dates, and observable outcome without inventing a universal result. A service page can name the tools, quality checks, and approval path. Evidence should be visible on the page, not placed only inside structured data.</p>`,
      },
      {
        id: 'entities-and-schema',
        title: 'Use consistent entities and accurate structured data',
        html: `<p>An entity is a distinct thing, such as the company, a person, a service, a location, or a product. Use one consistent public name for each important entity. Connect the company to its founder, services, contact details, and real locations through visible content and internal links.</p>
        <p>Structured data can reinforce these relationships. Organization markup may identify the company and logo. Article markup may identify an article, author, headline, and dates. Breadcrumb markup may describe the page hierarchy. The markup must match visible content and follow Google\'s structured data policies. Adding unrelated types or fabricated review values creates risk without adding truth.</p>`,
      },
      {
        id: 'page-experience',
        title: 'Protect the mobile reading and action path',
        html: `<p>Google recommends a good page experience for AI search features. For a service business, that means more than one performance score. Text should fit without horizontal scrolling. Navigation should work with touch and keyboard. Images should have useful dimensions and alternatives. Content should not jump as resources load. The main action should remain clear without covering the page with intrusive overlays.</p>
        <p>Core Web Vitals can help identify loading, responsiveness, and layout stability issues. Lab tools are useful for diagnosis, while field data shows what eligible real users experienced. Review both, then fix the bottleneck that affects the actual page template rather than chasing a perfect synthetic score.</p>`,
      },
      {
        id: 'measurement',
        title: 'Measure the page after publication',
        html: `<p>Submit the sitemap in Search Console and inspect important URLs, but remember that sitemap submission is a hint. Track indexing, query impressions, clicks, landing pages, and technical issues. Use Google\'s generative AI performance reporting where it is available, and pair it with analytics and CRM outcomes.</p>
        <p>For manual observation, define a stable set of questions and record the market, date, interface, response, cited sources, and your page\'s presence. Do not call a one time appearance a rank. Look for patterns across repeated observations and connect visibility to qualified visits and actions.</p>`,
      },
      {
        id: 'checklist',
        title: 'AI Overview readiness checklist',
        html: `<ul>
          <li>The page has a distinct purpose and a canonical URL.</li>
          <li>The main content is available in reliable, semantic HTML.</li>
          <li>The direct answer appears near a descriptive heading.</li>
          <li>Important claims have dates, authorship, context, or primary sources.</li>
          <li>The business, service, people, and location names are consistent.</li>
          <li>Structured data is accurate and limited to visible content.</li>
          <li>Mobile layout, keyboard access, links, and key interactions work.</li>
          <li>The page is linked internally and included in the current sitemap.</li>
          <li>Measurement definitions exist before results are interpreted.</li>
        </ul>`,
      },
    ],
    sources: [
      { title: 'AI optimization guide', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/fundamentals/ai-optimization-guide', note: 'Current official guidance for AI search visibility.' },
      { title: 'JavaScript SEO basics', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics', note: 'Official rendering and crawl guidance for JavaScript sites.' },
      { title: 'Creating helpful, reliable, people first content', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content', note: 'Google quality guidance for useful content.' },
      { title: 'Core Web Vitals', organization: 'web.dev', url: 'https://web.dev/articles/vitals', note: 'Google maintained definitions of key experience metrics.' },
      { title: 'Generative AI performance report', organization: 'Google Search Console Help', url: 'https://support.google.com/webmasters/answer/16984139', note: 'Official reporting guidance for generative AI traffic.' },
    ],
    related: [
      ['/aeo-geo/', 'AEO and GEO services'],
      ['/insights/javascript-seo-react-crawlable-html/', 'JavaScript SEO for React websites'],
      ['/insights/entity-first-content-architecture/', 'Entity first content architecture'],
    ],
  },
  {
    slug: 'website-redesign-checklist-service-businesses',
    category: 'Web optimization',
    title: 'Website Redesign Checklist for Service Businesses',
    description: 'A complete website redesign checklist covering strategy, content, technical SEO, accessibility, performance, forms, analytics, migration, launch, and follow up.',
    directAnswer: 'A service business redesign should protect more than the visual layer. Audit the current site, define page jobs, preserve valuable URLs, build accessible responsive templates, validate forms and analytics, map redirects, verify crawl controls, test the live release, and monitor search and lead quality after launch.',
    sections: [
      {
        id: 'before-design',
        title: 'Before design: document the current system',
        html: `<p>Begin with the live site, not a blank canvas. Inventory indexable URLs, templates, traffic landing pages, backlinks, conversion paths, forms, integrations, analytics events, downloads, structured data, and redirects. Capture desktop and mobile behavior. Record obvious technical failures and pages that remain valuable even if their design is weak.</p>
        <p>This baseline prevents a redesign from deleting useful content or breaking an operational path that nobody remembered to mention. It also separates visual dissatisfaction from structural problems. A new interface cannot fix unclear service ownership, missing proof, or a form that routes to the wrong CRM queue.</p>
        <ul>
          <li>Export current URLs and status codes.</li>
          <li>Review Search Console queries and landing pages.</li>
          <li>Document forms, destinations, owners, and consent language.</li>
          <li>Capture analytics definitions and current event names.</li>
          <li>Identify legal, accessibility, privacy, and platform constraints.</li>
        </ul>`,
      },
      {
        id: 'strategy',
        title: 'Strategy: give every page one clear job',
        html: `<p>Define the primary audience and the decision the website must support. Then assign a job to every planned page. The homepage should orient and route. Service pages should explain fit, process, evidence, and next steps. About pages should establish responsibility and relevant experience. Contact pages should make the next action clear. Articles should answer useful questions that deserve more depth.</p>
        <p>Create the sitemap around these jobs, not around the old navigation. If two pages serve the same intent, decide whether to consolidate them. If one page tries to serve several unrelated audiences, decide whether a clearer split would help. Keep the architecture understandable to a person before adding schema or automation.</p>`,
      },
      {
        id: 'content',
        title: 'Content: preserve facts and replace filler',
        html: `<p>Collect approved service descriptions, process details, team information, locations, credentials, project evidence, customer questions, policies, and source material. Mark what is current, what needs verification, and what cannot be published. A migration is the wrong time to carry unsupported claims into a cleaner design.</p>
        <p>Write page specific titles, descriptions, headings, and body content. Use direct language. Explain terms that buyers may not know. Add dates where freshness matters. Link primary sources for technical or regulatory statements. Use genuine project evidence instead of stock metrics. Plan image alternatives and captions while selecting the assets, not after launch.</p>
        <div class="callout"><strong>Migration rule</strong>Do not delete a useful page merely because the new visual system does not yet have a place for it. Decide whether to improve, consolidate, redirect, archive, or retain it.</div>`,
      },
      {
        id: 'design-accessibility',
        title: 'Design and accessibility: test the real interaction',
        html: `<p>Choose a visual direction that belongs to the business and can survive beyond the hero. Document typography, color, spacing, radius, components, imagery, and motion rules. Design the important states: navigation open and closed, focus, hover, form errors, success, loading, empty content, long headings, and narrow screens.</p>
        <p>Target WCAG 2.2 AA as a practical baseline. Use semantic landmarks and heading order. Provide visible keyboard focus, sufficient contrast, meaningful labels, descriptive text alternatives, reduced motion behavior, and touch targets that work on mobile. Do not hide important content behind a hover interaction that touch and keyboard users cannot reach.</p>`,
      },
      {
        id: 'technical',
        title: 'Technical SEO and performance: build the release path early',
        html: `<p>Decide how the stack will deliver crawlable pages. For JavaScript applications, prefer static generation or server rendering for content that search and answer systems should retrieve consistently. Add unique metadata and canonicals. Generate a sitemap with absolute preferred URLs. Configure robots rules intentionally and keep important assets available to crawlers.</p>
        <p>Set image dimensions, choose efficient formats, load critical resources carefully, and avoid large scripts that do not support the page job. Monitor Core Web Vitals, but interpret lab and field data correctly. Performance work should improve the actual experience, not hide content or remove necessary accessibility features to satisfy a score.</p>`,
      },
      {
        id: 'forms-data',
        title: 'Forms, CRM, and analytics: verify the full handoff',
        html: `<p>List every form and the record it should create or update. Define required fields, validation, consent, owner, notification, deduplication, lifecycle stage, and failure behavior. Test with controlled data in the correct portal. A visual success message is not proof that the contact reached the CRM correctly.</p>
        <p>Define analytics events before launch. Use names that describe meaningful actions, such as a submitted consultation request or a completed phone link click, rather than a collection of ambiguous button events. Validate tags in the real environment and document filters, attribution assumptions, and reporting latency.</p>`,
      },
      {
        id: 'migration-launch',
        title: 'Migration and launch: make the change reversible',
        html: `<ol>
          <li>Map every old URL to its retained page, consolidated destination, or appropriate removal status.</li>
          <li>Create direct redirects and avoid long redirect chains.</li>
          <li>Back up the current site and preserve the last known good deployment.</li>
          <li>Crawl the staging build for broken links, missing metadata, duplicate canonicals, and orphaned pages.</li>
          <li>Test forms, email notifications, CRM records, analytics, downloads, and key actions.</li>
          <li>Run desktop and mobile visual checks, keyboard checks, reduced motion checks, and browser console checks.</li>
          <li>Verify DNS, HTTPS, canonicals, robots, sitemap, status codes, and redirects on the live domain.</li>
        </ol>`,
      },
      {
        id: 'after-launch',
        title: 'After launch: watch evidence, not anxiety',
        html: `<p>Submit the sitemap through Search Console and monitor coverage, indexing, queries, clicks, Core Web Vitals, and crawl issues. Check redirects and top landing pages. Review form and call quality in the CRM. Compare defined periods with appropriate context rather than reacting to one day of volatility.</p>
        <p>Keep a release log with the deployment date, major URL changes, measurement changes, and known limitations. A redesign is complete only when the live site, operational handoffs, and search transition have been checked. The next optimization cycle should start from that verified state.</p>`,
      },
    ],
    sources: [
      { title: 'SEO Starter Guide', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide', note: 'Official search foundation and site organization guidance.' },
      { title: 'Site moves with URL changes', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes', note: 'Official migration and redirect guidance.' },
      { title: 'Web Content Accessibility Guidelines 2.2', organization: 'W3C', url: 'https://www.w3.org/TR/WCAG22/', note: 'Normative accessibility success criteria.' },
      { title: 'Core Web Vitals', organization: 'web.dev', url: 'https://web.dev/articles/vitals', note: 'Google maintained performance metric definitions.' },
      { title: 'Build and submit a sitemap', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap', note: 'Official sitemap format and submission guidance.' },
    ],
    related: [
      ['/web-design-optimization/', 'Website design and optimization'],
      ['/work/', 'Selected website work'],
      ['/insights/javascript-seo-react-crawlable-html/', 'JavaScript SEO for React websites'],
    ],
  },
  {
    slug: 'schema-markup-service-businesses',
    category: 'Structured data',
    title: 'Schema Markup for Service Businesses Without Fake Signals',
    description: 'What schema markup does, which types may fit a service business, and how to use it without fake reviews, ratings, or guarantees.',
    directAnswer: 'Schema markup is background code that gives search tools a structured description of information already visible on the page. Start with the real business, website, locations, people, articles, and navigation path. Choose an accurate type, test the code, keep it synchronized with the page, and never invent reviews, ratings, prices, credentials, or service areas.',
    sections: [
      {
        id: 'purpose',
        title: 'What structured data actually does',
        html: `<p>Structured data gives machines an explicit representation of information already available on a page. JSON-LD can identify a company as an Organization, name the author of an Article, connect a page to its BreadcrumbList, or describe a real LocalBusiness location. It can reduce ambiguity, but it does not independently prove that a statement is true.</p>
        <p>Google uses supported structured data types to understand pages and, in eligible cases, display search features. Eligibility is not a guarantee. A page must also meet technical, content, and policy requirements. Schema.org includes a much larger vocabulary than Google uses for rich results, so implementation should distinguish general semantic description from feature specific eligibility.</p>`,
      },
      {
        id: 'starting-set',
        title: 'A sensible starting set for a service business',
        html: `<table tabindex="0" aria-label="Schema type starting points"><thead><tr><th>Page or entity</th><th>Potential type</th><th>Use when</th></tr></thead><tbody>
          <tr><td>Company</td><td>Organization</td><td>The site clearly identifies the operating organization, logo, URL, and contact details.</td></tr>
          <tr><td>Physical location</td><td>A specific LocalBusiness subtype</td><td>The business has a real public location or service operation that fits the type and visible page.</td></tr>
          <tr><td>Founder or team member</td><td>Person or ProfilePage</td><td>The page presents a real person, role, image, and relevant public information.</td></tr>
          <tr><td>Guide or news post</td><td>Article or a more specific subtype</td><td>The page has a visible headline, author, publication date, and article body.</td></tr>
          <tr><td>Page hierarchy</td><td>BreadcrumbList</td><td>The breadcrumb reflects a real navigational or conceptual path.</td></tr>
          <tr><td>Service description</td><td>Service</td><td>The page describes a real offered service. This may add semantics even when it does not create a Google rich result.</td></tr>
        </tbody></table>
        <p>Use the most specific accurate subtype. A legal practice should not mark itself as a restaurant because another type exposes a desired property. If no type fits perfectly, a broader accurate type is safer than a specific false one.</p>`,
      },
      {
        id: 'organization',
        title: 'Organization markup: establish the public identity',
        html: `<p>Organization markup belongs on a page that establishes the business, commonly the homepage or about page. Include the exact public name, canonical URL, and logo. Add contact points, address, founder, or sameAs links only when they are accurate, public, and useful. Use absolute URLs and stable image assets.</p>
        <p>Keep names consistent across the markup and visible page. If the public brand is IMMOHRTAL Marketing Solutions, the page should not quietly introduce several unconnected legal or abbreviated names without explanation. If a field is unknown or not approved for publication, omit it. Empty and guessed fields do not add value.</p>`,
      },
      {
        id: 'articles',
        title: 'Article and author markup: show responsibility',
        html: `<p>Article markup should identify the headline, author, dates, image when available, and publisher. The visible page should show the same information. Use datePublished for the original publication date and dateModified when substantive changes are made. Do not automatically change the modification date on every build if the article itself did not change.</p>
        <p>The author should be a real Person or Organization responsible for the content. Fake expert profiles and mass generated biographies weaken trust. An author page can explain relevant experience, link to other work, and state how to contact or identify the person without pretending to hold credentials that are not present.</p>`,
      },
      {
        id: 'reviews',
        title: 'Reviews and ratings: do not manufacture eligibility',
        html: `<p>Review and AggregateRating properties are often abused because star displays attract attention. Only mark up reviews that are genuine, visible, allowed by policy, and attached to the correct reviewed entity. Do not copy third party ratings into first party markup without a valid basis. Do not create a rating value from internal sentiment or a handful of unpublished messages.</p>
        <p>Google\'s policies also limit self serving review displays for certain organization and local business contexts. Before implementing review markup, inspect the current documentation for the exact type and feature. When the requirements are not satisfied, publish honest testimonial or case study content without rating schema.</p>`,
      },
      {
        id: 'implementation',
        title: 'Implementation and validation workflow',
        html: `<ol>
          <li>Choose the visible page and list the factual entities it establishes.</li>
          <li>Select accurate schema.org types and check whether Google supports a related search feature.</li>
          <li>Generate JSON-LD from a single content source when possible so page text and markup stay synchronized.</li>
          <li>Use absolute canonical URLs for page, logo, image, and entity identifiers.</li>
          <li>Validate syntax with Schema.org and feature eligibility with Google\'s Rich Results Test where relevant.</li>
          <li>Inspect the rendered page and source to confirm the markup is delivered reliably.</li>
          <li>Monitor Search Console enhancement reports and revisit the markup when visible facts or policies change.</li>
        </ol>`,
      },
      {
        id: 'failure-patterns',
        title: 'Common failure patterns',
        html: `<ul>
          <li>Marking up content that is hidden from visitors.</li>
          <li>Using one organization object with several inconsistent names and URLs.</li>
          <li>Adding every possible type without a page level reason.</li>
          <li>Generating FAQ markup for questions that are not visibly answered.</li>
          <li>Inventing offers, prices, availability, reviews, or ratings.</li>
          <li>Using relative URLs that resolve differently across environments.</li>
          <li>Leaving old schema in the template after the visible content changes.</li>
          <li>Assuming a passing validator guarantees a rich result or AI citation.</li>
        </ul>
        <p>The best schema implementation is often smaller than expected. It describes the site\'s clearest facts, stays synchronized with visible content, and survives careful review.</p>`,
      },
    ],
    sources: [
      { title: 'Structured data general guidelines', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/appearance/structured-data/sd-policies', note: 'Official technical and quality policies.' },
      { title: 'Organization structured data', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/appearance/structured-data/organization', note: 'Supported organization properties and implementation guidance.' },
      { title: 'Article structured data', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/appearance/structured-data/article', note: 'Supported article properties and examples.' },
      { title: 'Schema.org documentation', organization: 'Schema.org', url: 'https://schema.org/docs/documents.html', note: 'Primary vocabulary documentation.' },
      { title: 'Review snippet structured data', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/appearance/structured-data/review-snippet', note: 'Current review markup requirements and restrictions.' },
    ],
    related: [
      ['/aeo-geo/', 'AEO and GEO services'],
      ['/insights/entity-first-content-architecture/', 'Entity first content architecture'],
      ['/insights/google-ai-overviews-service-businesses/', 'Google AI Overviews guide'],
    ],
  },
  {
    slug: 'ai-search-crawlers-discovery-citations',
    category: 'AI crawlers',
    title: 'How AI Search Crawlers Discover and Cite Websites',
    description: 'How AI tools find public websites, what robots.txt can control, and why allowing a crawler never guarantees a citation.',
    directAnswer: 'AI search tools can find a website through their own crawlers, search indexes, partner data, public links, and submitted discovery signals. A robots.txt file can allow or block named crawlers, but access does not guarantee that a page will be indexed or cited. Use readable public pages, stable URLs, useful links, a sitemap, accurate page information, and a deliberate crawler policy.',
    sections: [
      {
        id: 'discovery-paths',
        title: 'Discovery is a chain, not a single switch',
        html: `<p>A page can be discovered through links from other pages, an XML sitemap, a search engine index, a product specific crawler, or another data source. Discovery only means that a system has encountered the URL. The system may still choose not to crawl, index, retrieve, summarize, or cite it.</p>
        <p>Website owners control several important inputs: whether the URL is public, whether it returns useful HTML and a successful status, whether robots rules permit the named crawler, whether a canonical identifies the preferred page, and whether internal links make the page reachable. They do not control the final source selection inside an answer.</p>`,
      },
      {
        id: 'robots',
        title: 'robots.txt controls crawling by user agent',
        html: `<p>A robots.txt file lives at the root of a host and contains groups for crawler user agents. An Allow or Disallow rule can grant or restrict crawling for matching paths. Rules are public and should never contain secrets. A sitemap location can also be declared in the file.</p>
        <p>Robots exclusion is not an authentication system. A blocked URL may still be known through links or other sources, and malicious crawlers may ignore the rules. Sensitive content requires real access control. Test robots behavior against the exact host, protocol, path, and user agent because a rule on one subdomain does not automatically govern another.</p>`,
      },
      {
        id: 'openai',
        title: 'OpenAI separates search discovery from training controls',
        html: `<p>OpenAI documents OAI-SearchBot as the crawler used to surface websites in ChatGPT search. It documents GPTBot separately for potential use in training generative AI models. A publisher can allow OAI-SearchBot while disallowing GPTBot when it wants search discovery without granting the separate training crawler access.</p>
        <p>OpenAI also notes that robots changes can take time to be reflected. The exact user agent tokens and published IP information should be checked in the current official documentation before changing production controls. A website should not rely on a third party list copied months earlier.</p>`,
      },
      {
        id: 'perplexity-google',
        title: 'Perplexity and Google publish their own crawler guidance',
        html: `<p>Perplexity documents PerplexityBot and Perplexity-User, with different roles in indexing and user initiated retrieval. Google documents Googlebot and the robots protocol it supports. Each provider can define user agents, behavior, and controls differently, so one broad statement about all AI crawlers is unreliable.</p>
        <p>Create a small policy table for the business. Record the product, user agent, purpose described by the provider, current decision, source URL, and review date. This turns crawler access into a maintained business choice instead of a one time copy and paste operation.</p>
        <table tabindex="0" aria-label="Crawler policy questions"><thead><tr><th>Question</th><th>What to record</th></tr></thead><tbody>
          <tr><td>Which crawler?</td><td>Exact official user agent token and provider documentation.</td></tr>
          <tr><td>What purpose?</td><td>Search indexing, user initiated retrieval, model training, or another published purpose.</td></tr>
          <tr><td>What decision?</td><td>Allow, disallow, or path specific rule with a named owner.</td></tr>
          <tr><td>When reviewed?</td><td>Date checked and next review date.</td></tr>
        </tbody></table>`,
      },
      {
        id: 'crawlable-page',
        title: 'What an accessible crawler should find',
        html: `<p>When access is allowed, the page still needs useful output. Serve a descriptive title, canonical, main heading, visible body content, internal links, and appropriate metadata. Avoid placing the entire meaning behind a click, animation, canvas, or client side request that may fail. For JavaScript sites, use static generation or server rendering when practical.</p>
        <p>Link related pages with descriptive anchor text. Include the URL in an XML sitemap when it is canonical and intended for indexing. Return a real 404 or 410 for removed content rather than a visually missing page with a successful status. Keep redirect chains short and point moved pages to the closest relevant destination.</p>`,
      },
      {
        id: 'citation',
        title: 'Citation requires usefulness and selection',
        html: `<p>A crawler permission does not create a citation. The answer product may evaluate relevance, freshness, authority, corroboration, safety, and response quality. It may cite a page directly, rely on an underlying search index, use another source, or decide that the query does not need the page.</p>
        <p>Improve citation readiness by answering a specific question, naming the subject clearly, providing original and checkable information, using dates, identifying the responsible author or organization, and connecting the page to related evidence. Avoid writing repetitive passages that restate a keyword without adding usable information.</p>`,
      },
      {
        id: 'monitoring',
        title: 'Monitor access without overinterpreting it',
        html: `<p>Server logs can show requests from user agents, but a user agent string alone can be spoofed. Use provider published verification guidance when available. Search Console and analytics can show some discovery and traffic patterns, while manual citation observations can document what appeared for a controlled question set.</p>
        <p>Separate these states in reporting: discovered, crawled, indexed, shown, cited, visited, and converted. They are not interchangeable. If a source does not provide enough evidence for one state, label it unknown instead of inferring completion from the previous step.</p>`,
      },
      {
        id: 'checklist',
        title: 'Crawler readiness checklist',
        html: `<ul>
          <li>Confirm the canonical production host and protocol.</li>
          <li>Review robots.txt for wildcard and named crawler groups.</li>
          <li>Check current provider documentation before changing a user agent rule.</li>
          <li>Keep sensitive content behind authentication, not robots exclusion.</li>
          <li>Serve important content and links in reliable semantic HTML.</li>
          <li>Publish a current XML sitemap with absolute canonical URLs.</li>
          <li>Test status codes, canonicals, redirects, and removed pages.</li>
          <li>Record crawl, index, citation, visit, and conversion states separately.</li>
        </ul>`,
      },
    ],
    sources: [
      { title: 'Publishers and developers FAQ', organization: 'OpenAI', url: 'https://help.openai.com/en/articles/12627856-publishers-and-developers-faq', note: 'Official OAI-SearchBot and GPTBot guidance.' },
      { title: 'Perplexity crawlers', organization: 'Perplexity', url: 'https://docs.perplexity.ai/docs/resources/perplexity-crawlers', note: 'Official PerplexityBot and Perplexity-User documentation.' },
      { title: 'Robots.txt specifications', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt', note: 'Google supported robots protocol and syntax.' },
      { title: 'Build and submit a sitemap', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap', note: 'Official discovery and sitemap guidance.' },
    ],
    related: [
      ['/insights/javascript-seo-react-crawlable-html/', 'JavaScript SEO for React websites'],
      ['/insights/measure-ai-search-visibility/', 'Measure AI search visibility'],
      ['/aeo-geo/', 'AEO and GEO services'],
    ],
  },
  {
    slug: 'javascript-seo-react-crawlable-html',
    category: 'Technical SEO',
    title: 'JavaScript SEO for React Websites: Why Crawlable HTML Still Matters',
    description: 'Why important React website content should arrive as readable HTML, plus a practical checklist for pages that need to be found.',
    directAnswer: 'React can support search visibility, but an important service page should not disappear when JavaScript is slow or unavailable. Send readable HTML when practical, return the correct page status, give every page unique titles and descriptions, expose ordinary links, test what crawlers receive, and keep the experience useful before scripts finish loading.',
    sections: [
      {
        id: 'rendering',
        title: 'Rendering changes what arrives first',
        html: `<p>A traditional server page sends meaningful HTML in the initial response. A client rendered React application may send a small shell and rely on JavaScript to request data and construct the page. Google can render JavaScript, but rendering happens as an additional processing step and the application can fail before important content appears.</p>
        <p>Other crawlers and user initiated retrieval systems may execute less JavaScript, use different time limits, or rely on a search index rather than rendering the application directly. Crawlable HTML reduces this dependency. It also improves resilience for people on slow devices, unstable connections, restrictive networks, and assistive technology combinations.</p>
        <table tabindex="0" aria-label="Web rendering approaches"><thead><tr><th>Approach</th><th>Initial response</th><th>Typical use</th></tr></thead><tbody>
          <tr><td>Client rendering</td><td>Application shell, then JavaScript builds content</td><td>Highly interactive tools where indexing is secondary</td></tr>
          <tr><td>Static generation</td><td>Prebuilt HTML for each route</td><td>Service pages, articles, documentation, portfolios, and marketing pages</td></tr>
          <tr><td>Server rendering</td><td>HTML generated for each request or cached response</td><td>Dynamic indexable pages with current data</td></tr>
          <tr><td>Hybrid rendering</td><td>Different methods by route</td><td>Sites that combine marketing content and authenticated application surfaces</td></tr>
        </tbody></table>`,
      },
      {
        id: 'choose-method',
        title: 'Choose rendering by page job',
        html: `<p>Not every route needs the same rendering method. A public service page has stable content and benefits from static HTML. An article library can be generated from structured source files at build time. A dashboard behind authentication may rely on client rendering because search indexing is not its job. An inventory page may require server rendering or incremental generation because availability changes.</p>
        <p>Start with the user and indexing requirement. If a page should rank, be cited, or serve as a durable landing page, make its main content available without a long chain of client requests. Hydration can add interaction after the document arrives. A visual particle sequence or 3D scene can remain client side while the surrounding message, navigation, and links remain semantic.</p>`,
      },
      {
        id: 'metadata',
        title: 'Generate route specific metadata in the document',
        html: `<p>Every indexable route needs a distinct title and useful meta description. Add a self referencing canonical when the URL is the preferred version. Set robots directives intentionally. Provide Open Graph fields for sharing and a stable image when one is available. The title and main heading should describe the same page without being forced to match word for word.</p>
        <p>Client side metadata libraries can update the document after load, but static generation makes the values available in the first response. This is more reliable for crawlers, social preview systems, link unfurlers, and debugging tools. It also prevents every route from sharing the generic title in the original application shell.</p>`,
      },
      {
        id: 'status-routing',
        title: 'Return real status codes and stable routes',
        html: `<p>A single page application fallback often returns the homepage shell with a 200 status for every path, including routes that do not exist. This creates soft 404 behavior and makes removal or redirection difficult to express. Static hosts can serve a real file for each public route and return 404 for missing content. Server frameworks can set the status during rendering.</p>
        <p>When a URL moves, use a server redirect to the closest relevant destination. Do not rely only on a client effect that waits for the application to load and then changes location. Keep redirect chains short. When content is permanently removed without a replacement, return 404 or 410 and provide a useful human facing missing page.</p>`,
      },
      {
        id: 'links-content',
        title: 'Use crawlable links and semantic page structure',
        html: `<p>Google recommends standard anchor elements with resolvable href values. A click handler on a generic element may work for a person with a mouse and still fail as a discovery path. Use buttons for actions and anchors for navigation. Descriptive link text helps readers and systems understand the destination.</p>
        <p>Build the document with one main landmark, descriptive headings, paragraphs, lists, tables, figures, and article elements where those structures fit. Canvas and WebGL can create excellent visual experiences, but they should not be the only place that a client name, service description, or page relationship exists. Provide accessible text and static fallbacks for meaningful visual information.</p>`,
      },
      {
        id: 'hydration-performance',
        title: 'Hydrate only what needs to move',
        html: `<p>Shipping a large JavaScript bundle for static prose increases parsing, execution, and hydration work without improving the reading experience. Split code by route, lazy load noncritical interaction, and keep server or static content usable before hydration. Reserve heavy 3D, video, and data visualization for moments where they advance the page\'s argument.</p>
        <p>Set width and height for images, preload only critical resources, and avoid layout shifts when components hydrate. Watch Interaction to Next Paint, Largest Contentful Paint, and Cumulative Layout Shift in eligible field data. A fast blank shell is not a good result if the meaningful content arrives much later.</p>`,
      },
      {
        id: 'testing',
        title: 'Test what the server sends and what the browser renders',
        html: `<ol>
          <li>Request the production URL and inspect the response status, headers, and initial HTML.</li>
          <li>Confirm that title, canonical, main heading, body content, and important links exist in the expected output.</li>
          <li>Load the page with JavaScript disabled or delayed and confirm that the core message and navigation remain available.</li>
          <li>Use URL Inspection in Search Console for Google\'s indexed and live view.</li>
          <li>Crawl the production host to find duplicate titles, broken links, missing canonicals, soft 404s, and redirect chains.</li>
          <li>Check the browser console, network failures, mobile overflow, keyboard path, and reduced motion behavior.</li>
          <li>Validate structured data against the rendered page and visible content.</li>
        </ol>`,
      },
      {
        id: 'react-plan',
        title: 'A durable React publishing plan',
        html: `<p>For a React marketing site, keep interactive brand moments inside the application while generating service, about, contact, work, and article routes as static HTML. Use one content source to create page copy, metadata, structured data, internal links, sitemap entries, and feed items. This reduces drift between what the page says and what discovery files claim.</p>
        <p>Run generation before local development and production builds. Validate that every intended URL creates an output file. Keep the production origin in one configuration value. Then deploy the static routes with the application assets and verify the live domain, not only the local preview.</p>`,
      },
    ],
    sources: [
      { title: 'JavaScript SEO basics', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics', note: 'Official rendering, links, metadata, and status guidance.' },
      { title: 'Dynamic rendering as a workaround', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering', note: 'Google recommends server rendering, static rendering, or hydration over dynamic rendering.' },
      { title: 'Canonical URLs', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls', note: 'Official canonicalization methods and signals.' },
      { title: 'Core Web Vitals', organization: 'web.dev', url: 'https://web.dev/articles/vitals', note: 'Current user experience metrics.' },
    ],
    related: [
      ['/web-design-optimization/', 'Website design and optimization'],
      ['/insights/ai-search-crawlers-discovery-citations/', 'How AI search crawlers discover pages'],
      ['/insights/google-ai-overviews-service-businesses/', 'Google AI Overviews guide'],
    ],
  },
  {
    slug: 'hubspot-business-agents-safe-integration',
    category: 'CRM and agents',
    title: 'How to Connect Website Forms, HubSpot, and Business Agents Safely',
    description: 'How to move website form details into the right HubSpot account and AI workflow without mixing clients or sending the wrong message.',
    directAnswer: 'Start by naming the exact HubSpot account, the information the form collects, the customer consent, and what should happen next. Check for duplicate records, use narrow triggers, keep every client separate, make retries safe, and require human approval before an AI worker sends a message or changes an important account setting.',
    sections: [
      {
        id: 'map-flow',
        title: 'Map the whole handoff before adding an agent',
        html: `<p>A website form is one event inside a longer system. A visitor submits data. The site validates it and displays a result. A form service or API creates or updates a CRM record. A workflow may assign an owner, set a stage, notify a team, or request enrichment. An agent may research the company, summarize context, or prepare a draft. A person may approve an external response.</p>
        <p>Draw this path before implementation. Name the systems, account, portal, object type, fields, owner, trigger, output, error path, and authority at every step. If the flow cannot distinguish one client portal from another, the system is not ready for automation.</p>
        <div class="callout"><strong>Routing rule</strong>Resolve the exact client, HubSpot portal, form, recipient, and record before any write. Similar names are not a safe substitute for identity.</div>`,
      },
      {
        id: 'data-contract',
        title: 'Create a field and consent contract',
        html: `<p>Define what the form collects and why. Use the smallest set of fields that supports the next step. Record the internal property name, visible label, type, validation rule, required status, consent basis, and CRM destination. Keep sensitive data out of general marketing forms unless there is a clear need and proper control.</p>
        <p>Decide how contacts are matched. Email may be a practical identifier in many marketing contexts, but duplicate and shared addresses still require rules. Define how company records are associated, how existing values are preserved or updated, and which source properties document the submission. Do not let an agent overwrite authoritative fields because a public website contains a conflicting value.</p>
        <table tabindex="0" aria-label="HubSpot integration contract"><thead><tr><th>Contract item</th><th>Example decision</th></tr></thead><tbody>
          <tr><td>Destination</td><td>Exact portal ID and contact object</td></tr>
          <tr><td>Identity</td><td>Normalized email, with duplicate review rules</td></tr>
          <tr><td>Source</td><td>Form ID, page URL, timestamp, and campaign context</td></tr>
          <tr><td>Consent</td><td>Visible language and stored consent state</td></tr>
          <tr><td>Ownership</td><td>Named team or queue with fallback</td></tr>
        </tbody></table>`,
      },
      {
        id: 'workflow-triggers',
        title: 'Use narrow, observable workflow triggers',
        html: `<p>HubSpot workflows can enroll records based on events, filter criteria, schedules, or manual actions. Choose the trigger that matches the business event and document reenrollment behavior. A broad rule such as any recent contact update can create loops or repeated actions. A specific form submission or defined property transition is easier to observe and test.</p>
        <p>Include suppression rules for test records, current customers, internal domains, missing consent, or incomplete routing where appropriate. Define whether a record can enter more than once and what should happen when it changes during the workflow. Test with controlled records and verify each property, association, owner, task, and notification.</p>`,
      },
      {
        id: 'webhooks',
        title: 'Treat webhooks as untrusted network input',
        html: `<p>Webhooks can notify an external service when subscribed CRM events occur. The receiving endpoint should verify the request using HubSpot\'s current signature guidance, validate the event structure, limit payload size, and reject unsupported operations. Secrets belong in an authorized secret store, never in source code, page markup, logs, or an agent prompt.</p>
        <p>Events may arrive more than once or out of order. Use a stable event identifier or idempotency strategy so a retry does not create duplicate work. Acknowledge accepted events quickly, then process them through a durable queue. Record failures with enough context to retry safely without exposing protected values.</p>`,
      },
      {
        id: 'agent-role',
        title: 'Give the agent a bounded role',
        html: `<p>An agent can inspect the public company website, retrieve permitted CRM properties, classify the request, summarize known context, and prepare a draft brief. Its contract should state which objects and fields it can read, which it can propose changing, and which actions it cannot take.</p>
        <p>Read only and draft modes are strong defaults. The agent should cite the source for material facts, mark uncertainty, and stop when the company identity, portal, record, or recipient is ambiguous. It should not send an email, enroll an unrelated record, change owner, merge contacts, or publish content merely because it can reach the tool.</p>`,
      },
      {
        id: 'approval',
        title: 'Place approval at the consequential boundary',
        html: `<p>Approval should happen where the cost of a wrong action becomes meaningful. Research and summarization may run automatically when access is appropriate. A same thread email draft can be prepared without sending. A website change can be staged without publishing to an ambiguous property. A property update can be proposed without writing to the wrong portal.</p>
        <p>The approval request should show the exact action, target, relevant evidence, draft output, and material uncertainty. Approval applies to that preview and target. If the content or recipient changes, the system needs a new approval unless the person explicitly grants broader authority.</p>`,
      },
      {
        id: 'receipts',
        title: 'Verify records and return receipts',
        html: `<p>A successful API response is only one part of verification. Read back the contact or company record and confirm the intended properties, associations, owner, and activity. For a draft, verify that it remains unsent and has the correct recipients, subject, body, and thread. For a workflow, inspect enrollment history and the next action.</p>
        <p>Return a receipt with the client, portal, object ID, action, status, timestamp, evidence locator, and any pending review. Use precise status words such as drafted, staged, sent, verified live, blocked, or failed. Do not collapse them into done.</p>`,
      },
      {
        id: 'first-workflow',
        title: 'Start with one safe workflow',
        html: `<ol>
          <li>Select a repetitive intake path with a clear owner and low cost of review.</li>
          <li>Document the field, consent, matching, and routing contract.</li>
          <li>Run the workflow in test or draft mode with controlled records.</li>
          <li>Add source located enrichment and summary output without external delivery.</li>
          <li>Measure routing accuracy, review time, duplicate rate, and failure handling.</li>
          <li>Expand authority only after repeated receipts show that the boundaries work.</li>
        </ol>`,
      },
    ],
    sources: [
      { title: 'Webhooks API guide', organization: 'HubSpot Developers', url: 'https://developers.hubspot.com/docs/api-reference/latest/webhooks/guide', note: 'Official subscription, event, and webhook behavior guidance.' },
      { title: 'Marketing form events', organization: 'HubSpot Developers', url: 'https://developers.hubspot.com/docs/api-reference/latest/marketing/forms/global-form-events', note: 'Official browser form event documentation.' },
      { title: 'Set workflow enrollment triggers', organization: 'HubSpot Knowledge Base', url: 'https://knowledge.hubspot.com/workflows/set-your-workflow-enrollment-triggers', note: 'Official workflow enrollment and reenrollment guidance.' },
      { title: 'NIST AI Risk Management Framework', organization: 'National Institute of Standards and Technology', url: 'https://www.nist.gov/itl/ai-risk-management-framework', note: 'Primary framework for governing AI risks and controls.' },
    ],
    related: [
      ['/business-agents/', 'Business agent systems'],
      ['/insights/human-approval-gates-for-marketing-agents/', 'Human approval gates'],
      ['/contact/', 'Map a website and CRM workflow'],
    ],
  },
  {
    slug: 'measure-ai-search-visibility',
    category: 'Measurement',
    title: 'How to Measure AI Search Visibility Without Made Up Rankings',
    description: 'How to tell whether a business is becoming easier to find in AI search without inventing a universal ranking score.',
    directAnswer: 'Measure AI search visibility with several honest signals: whether important pages can be found, search impressions and visits, available AI traffic reports, repeated citation checks for the same questions, useful actions on the website, and outcomes recorded in the CRM. Record the date and method. One screenshot is evidence from one moment, not a permanent ranking.',
    sections: [
      {
        id: 'why-rankings-fail',
        title: 'Why one AI ranking number is misleading',
        html: `<p>Generated answers can vary by product, market, time, prompt wording, user context, model, source freshness, and interface. Some systems show citations, some provide links in a separate panel, and some rely on an underlying search index. A single position does not represent all of those experiences.</p>
        <p>Third party visibility tools can provide useful observations when their methods are transparent, but their score is still a model of sampled behavior. It should not be reported as universal market share or permanent rank. The business needs a measurement framework that preserves each underlying state.</p>`,
      },
      {
        id: 'funnel',
        title: 'Separate the visibility states',
        html: `<table tabindex="0" aria-label="Search visibility measurement states"><thead><tr><th>State</th><th>Question</th><th>Evidence</th></tr></thead><tbody>
          <tr><td>Accessible</td><td>Can the intended crawler retrieve the page?</td><td>Robots rules, status, rendered HTML, and logs when verified</td></tr>
          <tr><td>Indexed</td><td>Is the canonical page in a search index?</td><td>Search Console URL Inspection or provider specific evidence</td></tr>
          <tr><td>Visible</td><td>Does the page or brand appear for a defined query?</td><td>Search performance or timestamped observation</td></tr>
          <tr><td>Cited</td><td>Is the URL named as a source in a generated response?</td><td>Captured response with query, date, interface, and URL</td></tr>
          <tr><td>Visited</td><td>Did a person arrive from that surface?</td><td>Analytics source data with known limitations</td></tr>
          <tr><td>Qualified</td><td>Did the visit produce a useful business action?</td><td>Validated form, call, booking, or CRM record</td></tr>
          <tr><td>Outcome</td><td>Did the qualified action create business value?</td><td>CRM lifecycle and revenue data with attribution context</td></tr>
        </tbody></table>
        <p>A page can be indexed without being cited, cited without receiving a click, or visited without producing a qualified action. Reporting these separately prevents a discovery signal from being mislabeled as revenue.</p>`,
      },
      {
        id: 'search-console',
        title: 'Use Search Console as a primary website source',
        html: `<p>Search Console provides Google search performance by query, page, country, device, date, and search appearance where supported. Google has also introduced a generative AI performance report for eligible data. Use the documentation for the current report because fields and availability can change.</p>
        <p>Record the property, reporting dates, filters, time zone, and comparison method. Confirm that the preferred domain and protocol are covered. Search Console data is not the same as analytics sessions, and recent data may be incomplete. Export the underlying rows when a claim depends on a small set of pages or queries.</p>`,
      },
      {
        id: 'observation-set',
        title: 'Build a repeatable citation observation set',
        html: `<p>Select questions that reflect actual customer decisions. Include a mix of category, service, location, process, comparison, and problem questions. Freeze the wording for a measurement period so changes reflect the observed system rather than constant prompt edits.</p>
        <p>For each observation, record the exact question, product, interface, account state if relevant, location, date and time, response, cited domains, cited URLs, brand mention, and capture. Repeat on a defined schedule. Mark errors and unavailable products rather than replacing them with a different test.</p>
        <ul>
          <li>Use a versioned question set and a named owner.</li>
          <li>Separate brand mentions from direct URL citations.</li>
          <li>Distinguish citations to the company site from third party profiles.</li>
          <li>Keep historical observations instead of overwriting the last result.</li>
          <li>Report sample size and coverage with every summary.</li>
        </ul>`,
      },
      {
        id: 'analytics',
        title: 'Connect visits to meaningful on site actions',
        html: `<p>Analytics can identify referral traffic when the source is passed and classified correctly. AI products may use several domains, apps, privacy methods, or link wrappers, so direct and referral classifications can be incomplete. Maintain a documented channel rule and review it as products change.</p>
        <p>Measure landing page, engaged visit, scroll or reading behavior when useful, contact clicks, form starts, successful submissions, call actions, bookings, and downloads tied to a real page job. Avoid creating dozens of decorative events that make the dashboard look busy without clarifying user intent.</p>`,
      },
      {
        id: 'crm',
        title: 'Validate lead quality in the CRM',
        html: `<p>A successful form event is not proof of a qualified lead. Read back the CRM record and verify that the submission exists, contact information is usable, consent is present, source context is retained, and the request matches the business. Define qualification with the people who follow up.</p>
        <p>Track lifecycle progression with an appropriate attribution caveat. A generated answer may introduce the company, while a later branded search or direct visit produces the form. Multi touch behavior does not fit cleanly into one last click number. Use the data to support decisions, not to claim certainty it cannot provide.</p>`,
      },
      {
        id: 'scorecard',
        title: 'A defensible monthly scorecard',
        html: `<ul>
          <li><strong>Technical access:</strong> indexable priority pages, errors, and important crawl changes.</li>
          <li><strong>Search discovery:</strong> impressions, clicks, landing pages, and query themes with defined filters.</li>
          <li><strong>Generative AI reporting:</strong> eligible Search Console or analytics data with coverage notes.</li>
          <li><strong>Citation observations:</strong> fixed sample size, brand mentions, direct citations, source mix, and changes.</li>
          <li><strong>On site behavior:</strong> qualified actions by landing page and source where available.</li>
          <li><strong>CRM outcomes:</strong> validated leads, qualification, progression, and known attribution limits.</li>
          <li><strong>Work completed:</strong> published pages, technical changes, evidence updates, and next tests.</li>
        </ul>
        <p>Use whole counts for discrete leads and events. Include the reporting dates and source of truth. Label pending validation instead of converting missing evidence into zero.</p>`,
      },
      {
        id: 'interpretation',
        title: 'Interpret change with restraint',
        html: `<p>Look for repeated patterns across enough time to account for seasonality, reporting delay, site releases, and demand changes. Annotate major content, technical, and measurement changes. Compare equivalent periods when possible and avoid declaring causation from a simultaneous movement.</p>
        <p>The objective is not to produce the largest number. It is to learn which pages and questions create verified discovery, useful visits, and qualified business conversations, then improve the system with evidence.</p>`,
      },
    ],
    sources: [
      { title: 'Generative AI performance report', organization: 'Google Search Console Help', url: 'https://support.google.com/webmasters/answer/16984139', note: 'Official report definitions and current availability.' },
      { title: 'Performance report', organization: 'Google Search Console Help', url: 'https://support.google.com/webmasters/answer/7576553', note: 'Official query, page, filter, and data interpretation guidance.' },
      { title: 'AI optimization guide', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/fundamentals/ai-optimization-guide', note: 'Official guidance on AI feature traffic and measurement.' },
      { title: 'URL Inspection tool', organization: 'Google Search Console Help', url: 'https://support.google.com/webmasters/answer/9012289', note: 'Official indexed and live URL inspection guidance.' },
    ],
    related: [
      ['/aeo-geo/', 'AEO and GEO services'],
      ['/insights/ai-search-crawlers-discovery-citations/', 'AI search crawlers and citations'],
      ['/insights/google-ai-overviews-service-businesses/', 'Google AI Overviews guide'],
    ],
  },
  {
    slug: 'entity-first-content-architecture',
    category: 'Content architecture',
    title: 'Entity First Content Architecture for Service Businesses',
    description: 'How to organize the real parts of a business, including services, people, locations, and proof, into pages search tools can understand.',
    directAnswer: 'Entity first content architecture simply starts with the real things a business needs to explain: the company, services, people, locations, projects, credentials, and customer questions. Give each important subject one clear home page, use consistent names and facts, connect related pages with descriptive links, and add structured data only when it matches what visitors can see.',
    sections: [
      {
        id: 'what-entity-first-means',
        title: 'Start with things and relationships, not a keyword spreadsheet',
        html: `<p>A keyword list records language people use. An entity model records what the business is talking about. The organization is an entity. Each meaningful service is an entity. Founders, specialists, locations, products, certifications, and documented projects may also be entities. Questions and topics describe how people seek information about them.</p>
        <p>Entity first does not mean ignoring search demand. It means using demand to improve a coherent model instead of producing disconnected pages for every phrase. The business should be able to draw the relationship between the company, a service, the person responsible, the location served, the evidence available, and the questions a buyer asks.</p>`,
      },
      {
        id: 'inventory',
        title: 'Build an approved entity inventory',
        html: `<p>List the entities the business can support publicly. Record the preferred name, type, concise description, canonical page, important attributes, related entities, public sources, owner, and review date. Mark facts that are provisional, private, outdated, or unavailable.</p>
        <table tabindex="0" aria-label="Business entity inventory"><thead><tr><th>Entity type</th><th>Core facts</th><th>Potential evidence</th></tr></thead><tbody>
          <tr><td>Organization</td><td>Public name, URL, contact, founder, operating area</td><td>About page, legal record, public profiles</td></tr>
          <tr><td>Service</td><td>Scope, fit, process, limits, next step</td><td>Service documentation, project examples, source material</td></tr>
          <tr><td>Person</td><td>Name, role, relevant experience, authored work</td><td>Profile page, article bylines, approved credentials</td></tr>
          <tr><td>Location</td><td>Address or service area, availability, local context</td><td>Location page, verified business profile</td></tr>
          <tr><td>Project</td><td>Client or category, constraint, work, date, observable result</td><td>Case study, live page, deployment or project artifact</td></tr>
        </tbody></table>
        <p>Do not add an entity merely because a schema property exists. Add it because the business needs to explain a real thing consistently.</p>`,
      },
      {
        id: 'canonical-pages',
        title: 'Give important entities a canonical home',
        html: `<p>Choose the page that establishes each important entity. The about page can establish the organization and founder. A service page can own the full explanation of one service. A location page can own a real geographic operation. A project page can document one engagement or build.</p>
        <p>Other pages can mention the entity and link back to its canonical home with descriptive text. This creates a comprehensible site graph. It also reduces duplication because supporting articles can answer narrower questions without repeating the complete service description.</p>
        <div class="callout"><strong>Page ownership test</strong>If two pages both claim to be the definitive explanation of the same thing, decide which one owns it and what distinct job the other page performs.</div>`,
      },
      {
        id: 'question-map',
        title: 'Attach real questions to the right entity and page',
        html: `<p>Collect questions from sales, support, search data, reviews, forums, and subject matter experts. Classify them by the entity and decision they concern. A question about service fit belongs near the service. A question about a specialist\'s experience may belong on the person page. A complex regulatory explanation may need an article linked from the relevant service.</p>
        <p>Prioritize questions by business importance, user need, evidence availability, and content gap. Search volume can inform the decision but should not force a page when the business lacks authority or a useful answer. One complete response is usually more valuable than several thin variations.</p>`,
      },
      {
        id: 'internal-links',
        title: 'Use internal links to express relationships',
        html: `<p>Navigation shows the broad structure, while contextual links show meaning. A service page can link to the responsible team member, a related project, a detailed process guide, and the contact path. An article can link to the service it supports and to primary sources. A project can link back to the capabilities demonstrated.</p>
        <p>Use descriptive anchor text rather than repeated phrases such as learn more. Keep links useful to a reader. Avoid creating a dense mesh where every mention links everywhere. The relationship should answer why the destination helps at that moment.</p>`,
      },
      {
        id: 'evidence-and-consistency',
        title: 'Maintain a shared fact and evidence layer',
        html: `<p>Store approved public facts in a source that content owners can review. The organization name, founder, contact details, service names, locations, and credentials should not drift across templates. When a fact changes, update the canonical source, visible pages, structured data, profiles, and discovery files that depend on it.</p>
        <p>Attach evidence to claims. Record the source URL or artifact, publication date, last verification date, approved wording, and limitations. This is especially important for statistics, regulations, certifications, rankings, and time sensitive platform behavior. When evidence expires or becomes unavailable, revise the claim rather than carrying it forward automatically.</p>`,
      },
      {
        id: 'structured-data',
        title: 'Let structured data mirror the visible graph',
        html: `<p>JSON-LD can express selected relationships explicitly. Organization markup can name the founder and logo. ProfilePage can identify the person presented on an about page. Article can connect a guide to its author and publisher. BreadcrumbList can represent page hierarchy.</p>
        <p>Use stable absolute identifiers and URLs. Keep the markup limited to facts visible or clearly established on the page. Structured data should be generated from the same content source when practical, then validated after rendering. It is a semantic aid, not a substitute for the page.</p>`,
      },
      {
        id: 'governance',
        title: 'Govern the architecture as the business changes',
        html: `<ol>
          <li>Assign an owner to each core entity and canonical page.</li>
          <li>Record the approved name, description, facts, sources, and review date.</li>
          <li>Audit new pages for duplicate ownership and unsupported relationships.</li>
          <li>Review high risk or time sensitive facts on a defined schedule.</li>
          <li>Update visible content, structured data, sitemap, and internal links together.</li>
          <li>Retire or redirect obsolete pages with an explicit reason and destination.</li>
        </ol>
        <p>A maintained entity model gives design, content, SEO, CRM, and agent workflows a shared vocabulary. That consistency is the real advantage.</p>`,
      },
    ],
    sources: [
      { title: 'Organization structured data', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/appearance/structured-data/organization', note: 'Official organization identity and property guidance.' },
      { title: 'Article structured data', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/appearance/structured-data/article', note: 'Official article, author, and publisher guidance.' },
      { title: 'Schema.org documentation', organization: 'Schema.org', url: 'https://schema.org/docs/documents.html', note: 'Primary structured vocabulary documentation.' },
      { title: 'SEO Starter Guide', organization: 'Google Search Central', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide', note: 'Official site organization and link guidance.' },
    ],
    related: [
      ['/insights/schema-markup-service-businesses/', 'Schema markup for service businesses'],
      ['/aeo-geo/', 'AEO and GEO services'],
      ['/insights/aeo-vs-geo-service-businesses/', 'AEO vs GEO'],
    ],
  },
  {
    slug: 'human-approval-gates-for-marketing-agents',
    category: 'Agent governance',
    title: 'Where AI Marketing Workers Need Human Approval',
    description: 'A plain-language guide to what AI can safely prepare and which messages, purchases, account changes, and deletions still need a person.',
    directAnswer: 'Require a person to approve anything that sends a message, publishes work, spends money, changes access, alters an important record, deletes data, crosses into another client, or continues when the target is unclear. AI workers can safely research, draft, test, and stage well-defined work. Every run should show what was only prepared and what was actually executed.',
    sections: [
      {
        id: 'why-gates',
        title: 'Autonomy should expand with evidence',
        html: `<p>Marketing agents can inspect websites, gather sources, classify prospects, draft content, prepare CRM updates, test pages, and monitor systems. These jobs can save time because their inputs and outputs are reviewable. The risk changes when the agent sends a message, publishes a claim, changes a live account, spends money, deletes data, or acts for the wrong client.</p>
        <p>An approval gate is a designed control at that boundary. It is not a vague instruction to be careful. The workflow stops, presents the exact action and evidence, receives a decision from an authorized person, records the decision, and executes only the approved version.</p>`,
      },
      {
        id: 'risk-tiers',
        title: 'Classify actions by consequence and reversibility',
        html: `<table tabindex="0" aria-label="AI worker action risk tiers"><thead><tr><th>Tier</th><th>Examples</th><th>Default control</th></tr></thead><tbody>
          <tr><td>Observe</td><td>Read a public page, retrieve allowed analytics, inspect a draft</td><td>Automatic with exact scope and access logging</td></tr>
          <tr><td>Prepare</td><td>Summarize sources, draft an article, stage code, propose a CRM update</td><td>Automatic when output remains reviewable and isolated</td></tr>
          <tr><td>Modify reversible</td><td>Update a noncritical field, create a test record, deploy to an approved staging target</td><td>Policy based authority with read back verification</td></tr>
          <tr><td>Communicate or publish</td><td>Send email, post publicly, publish to a live property</td><td>Exact preview and explicit approval unless standing authority is documented</td></tr>
          <tr><td>Spend or access</td><td>Change ad budget, grant permissions, consent to an integration</td><td>Human approval and account verification</td></tr>
          <tr><td>Destructive or ambiguous</td><td>Delete records, replace broad data, act when client identity is unclear</td><td>Stop, verify target, preserve recovery, require explicit authority</td></tr>
        </tbody></table>
        <p>Risk depends on context. Editing a test property is different from changing a production contact owner. Publishing to a verified existing site is different from creating a new public property. The contract should name the target and environment.</p>`,
      },
      {
        id: 'gate-contract',
        title: 'Define what the approval must show',
        html: `<p>A useful approval request contains the requested action, exact target, proposed output, evidence freshness, material uncertainty, expected consequence, and recovery path when relevant. It should be short enough to review and specific enough to prevent approval from becoming a blank check.</p>
        <ul>
          <li><strong>Identity:</strong> client, account, portal, repository, domain, recipient, or publication property.</li>
          <li><strong>Action:</strong> send, publish, update, delete, spend, grant, or execute.</li>
          <li><strong>Preview:</strong> exact message, page, field change, amount, or command result.</li>
          <li><strong>Evidence:</strong> source links, timestamps, tests, and current state.</li>
          <li><strong>Uncertainty:</strong> missing facts, conflicts, and assumptions that affect the decision.</li>
          <li><strong>Recovery:</strong> draft retention, backup, previous deployment, or rollback path.</li>
        </ul>`,
      },
      {
        id: 'communications',
        title: 'Treat outreach and client communication as exact delivery',
        html: `<p>An agent can research a business and prepare a personalized draft. Before sending, the workflow should verify the recipient, thread, reply routing, subject, body, attachments, signature, and evidence. Approval applies to the exact preview. If the content or recipient changes, request a new decision unless the person has explicitly authorized the change.</p>
        <p>Drafting is not sending. Saving a local specification is not creating a mail draft. Creating a mail draft is not external delivery. A receipt should preserve those states and read back the final sent message when delivery is approved.</p>`,
      },
      {
        id: 'publishing-spend',
        title: 'Require stronger gates for publishing and spend',
        html: `<p>Publishing creates a public record and can affect search, reputation, and legal exposure. Verify the exact domain, page, claim sources, dates, structured data, links, and live result. A standing approval can cover a clearly named existing property and bounded type of change, but it should not silently extend to another client or a new site.</p>
        <p>Advertising changes money and platform behavior. Start read only. Verify the account, campaign, conversion definitions, reporting dates, and tracking health before recommending a change. Show the proposed amount, date range, objective, and expected guardrails. Never infer authority to change spend from permission to inspect performance.</p>`,
      },
      {
        id: 'authentication',
        title: 'Human authentication gates stay human',
        html: `<p>Routine account selection and approved password manager autofill can be part of an established workflow. Multi factor prompts, passkeys, CAPTCHA, recovery codes, new consent, and push approvals require a person. Agents should not silently retrieve one time codes from email or expose secrets in prompts, logs, source files, or receipts.</p>
        <p>After access, the workflow still needs the exact account and capability scope. A valid login is not permission to act across every connected client. Record nonsecret access metadata and keep credentials in an authorized secret manager.</p>`,
      },
      {
        id: 'failure-states',
        title: 'Design explicit failure states',
        html: `<p>A worker should stop on ambiguous identity, unavailable primary evidence, authentication gates, missing permissions, conflicting instructions, unsafe targets, and failed verification. Stopping is useful when the receipt explains what succeeded, what remains incomplete, why continuation is unsafe, and the one decision or state change required.</p>
        <p>Do not convert an unknown state into success. A configured integration is not proof that a workflow ran. A deployment command is not proof that the live URL changed. A 200 response is not proof that the right record was updated. Verification should inspect the final artifact or state.</p>`,
      },
      {
        id: 'receipts',
        title: 'Use receipts to earn broader autonomy',
        html: `<p>Every run should return the job, exact scope, sources, actions, output, tests, external state, and remaining uncertainty. Use status labels consistently: prepared, drafted, staged, approved, sent, published, verified live, blocked, failed, or rolled back.</p>
        <p>Review repeated runs for routing accuracy, source quality, false certainty, intervention rate, error recovery, and business value. Broaden authority only when the workflow demonstrates reliable behavior inside its current boundary. If the environment, account, or consequence changes, reassess the gate.</p>`,
      },
      {
        id: 'implementation',
        title: 'A minimum governance implementation',
        html: `<ol>
          <li>Inventory agent actions and classify their consequence, reversibility, and data sensitivity.</li>
          <li>Assign exact identities, allowed tools, client boundaries, and output contracts.</li>
          <li>Set read only or draft mode as the default for new workflows.</li>
          <li>Place approval immediately before consequential tool execution.</li>
          <li>Bind approval to an exact target and preview with an expiration or run identifier.</li>
          <li>Read back the external state after execution and return a structured receipt.</li>
          <li>Review failures and interventions before expanding authority.</li>
        </ol>
        <p>Good governance does not prevent useful automation. It makes useful automation repeatable because the business can see where the worker is allowed to move and what proves the job was completed.</p>`,
      },
    ],
    sources: [
      { title: 'NIST AI Risk Management Framework', organization: 'National Institute of Standards and Technology', url: 'https://www.nist.gov/itl/ai-risk-management-framework', note: 'Primary framework for mapping, measuring, managing, and governing AI risk.' },
      { title: 'Artificial Intelligence Risk Management Framework: Generative AI Profile', organization: 'National Institute of Standards and Technology', url: 'https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf', note: 'NIST generative AI risk profile and actions.' },
      { title: 'Webhooks API guide', organization: 'HubSpot Developers', url: 'https://developers.hubspot.com/docs/api-reference/latest/webhooks/guide', note: 'Official event and integration behavior for a common marketing system.' },
      { title: 'OpenAI safety best practices', organization: 'OpenAI Platform', url: 'https://platform.openai.com/docs/guides/safety-best-practices', note: 'Official guidance on human review, adversarial testing, and constrained inputs and outputs.' },
    ],
    related: [
      ['/business-agents/', 'Business agent systems'],
      ['/insights/hubspot-business-agents-safe-integration/', 'HubSpot and business agents'],
      ['/contact/', 'Map a bounded agent workflow'],
    ],
  },
]
