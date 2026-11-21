---
title: Lion is bigger than us
published: true
description: "Seven years measured: 4.37 million npm installs a year, 9.7x growth in fifteen months, nine organisations shipping Lion in production and 319 people outside ING who sent us code, issues and tests we did not pay for."
date: 2026-11-07
tags: [javascript, community]
cover_image: /blog/images/lion-is-bigger-than-us.png
cover_credits: "plate, scene and mark - Lion"
eleventyNavigation:
  key: Lion is bigger than us
  title: Lion is bigger than us
---

Lion is bigger than the team that maintains it, and that is the point. Seven years after it went public it is infrastructure that parties outside ING build on: the Dutch railways, a AAA game studio, an enterprise software vendor, a university LMS, a German consultancy and the web components community itself - while the library keeps getting installed more often every year. Every number below can be re-measured from the companion data set; nothing is rounded up, and where a number *is* an estimate it says so.

![Lion in numbers: 4,367,538 npm downloads a year, 9.7x growth of @lion/ui, 1,973 stars, 319 external contributors, 81 public repos with a hard dependency, 2,061 releases](/blog/images/lion-outside-01-numbers.png)

## It starts with installs, not stars

Over the last twelve months the `@lion/*` family was installed **4,367,538 times** across 46 published packages. `@lion/core` alone accounts for 1,439,180 installs a year. That is not a one-off spike; it is traffic that comes back month after month.

And it is growing. `@lion/ui`, the current line, went from **6,374 installs in May 2025 to 61,947 in August 2026** - a factor of 9.7 in fifteen months.

![Monthly npm downloads of @lion/ui and @lion/core, May 2025 to October 2026](/blog/images/lion-outside-02-growth.png)

The second line in that chart matters too: `@lion/core` does not collapse. The world is still on the split packages while we consolidate into one. **Anyone who measures only `@lion/ui` sees roughly a tenth of the real usage** - which is why the npm reverse-dependency count shows 73 dependent packages and 308 dependent repositories on `@lion/core`, against 6 and 3 on `@lion/ui`.

For scale, in the same market `@lion/core` sits above VMware Clarity, Red Hat PatternFly, Oracle JET, the City of Utrecht component library, Just Eat Takeaway PIE, the Dutch government's Rijkshuisstijl community, RVO and Pega's own Constellation. Shoelace, Google Material Web, Vaadin, SAP UI5 and IBM Carbon are bigger. That is the company we are measured in, and it is where a white-label foundation belongs.

## Who builds on it

![Nine organisations using Lion in production, each with the type of evidence: own publication, declared dependency or npm reverse dependency](/blog/images/lion-outside-03-adopters.png)

The most convincing consumers are the ones who write it down themselves:

- **NS (Netherlands Railways), design system Tractie.** Their own *State of Tractie* release notes and the `@tractie/components` changelog name a Lion bug fix and a compatibility issue between Lion components and mixins. They took Lion's checkbox and radio groups as a base and were still rolling Lion's field mixin into their form components in January 2026.
- **Ubisoft Montréal.** Their internal design system *Egg* is built on Lion and they published their own engineering article about it; the version that appeared on ING's blog was written by Mathieu Puech of Ubisoft, who has since contributed 22 commits, 19 pull requests, 30 issues and Lion's Playwright visual-regression infrastructure.
- **Pega** ships a public SDK with `@lion/ui` as a dependency. **Apereo Sakai** (a university LMS) runs it in its webcomponents tool. **Tokens Studio** uses it in the style-dictionary configurator. **open-wc and Modern Web** - the community Lion itself grew out of - use it in their documentation tooling. **iteratec**, a German IT consultancy, publishes its PIXEL design system on `@lion/ui` and `@lion/button`.
- Beyond the named ones: **81 public repositories** declare a hard `@lion/*` dependency in a `package.json` or a lockfile, across 69 distinct owners.

That is a floor, not a total. Private registries are invisible: NS keeps its Tractie components in an Azure Artifacts feed behind an NS login, so no public instrument will ever see them.

## Who does the work

![External contributions per year, plus the line split: 7,076 test lines, 5,197 product lines, 2,911 documentation lines](/blog/images/lion-outside-04-contributions.png)

Across the whole history, **319 people outside ING have contributed** to Lion; 201 of them wrote code. Together they sent **400 pull requests** (260 merged), **339 issues** - 55% of every issue the project has ever had - and 73 of its 121 discussions. They gave us 1,154 comments and 807 reviews on their own work.

The sharpest number: external contributors wrote **7,076 lines of test code against 5,197 lines of product code** in 195 different test files. They added more tests than features - exactly the work that is least visible in a team dashboard and most expensive to do yourself.

And it is not small change. From that stream came a complete accordion component (an engineer from IKEA), the `input-amount-dropdown` package, the Playwright visual regression suite, the fix that puts Dutch currency symbols in the right place, the jump to Lit 2 (an engineer from IBM) and repo-wide ESLint and Prettier modernisations.

**38 external people were active in the last twelve months**; 2026 so far brought 45 external pull requests and 11 issues. That is below the 2020 peak of 97 external pull requests, and the honest reading is that the *project's* behaviour - response time, roadmap, invitations - decides that number, not the value of the library.

## What it costs and what it returns

| what it costs | what it returns |
|---|---|
| the core team maintains the library and the release cadence | 400 external pull requests, 339 external issues and 7,076 lines of external test code that ING did not pay for |
| maintaining a public API and its documentation | 4.37 million installs a year at consumers we do not have to support |
| review and triage time | 4,599 code reviews and over 4,600 comments in the repository, 807 of them on external work |
| the risk that someone files a public issue about a bug | nine organisations shipping Lion in production and documenting it publicly - two of which are quotable in a budget discussion |
| | 39% of every star ING has on GitHub sits on this one project: the brand asset that makes ING's engineers visible internationally |

On the cost side of the release work: `@lion/ui` alone has shipped 120 releases since November 2022, a median of seven days between them, for four years without a gap. On the return side, take the external work conservatively: 400 pull requests, 339 issues and 73 discussions is 812 external work items; at two hours each that is over 1,600 hours, or about one FTE-year ING did not pay for. The line counts are measured; the hours are an assumption, and it is labelled as one.

## What we are not claiming

This is written to survive disagreement, so the weak spots are on the page:

- **Download counts are not unique companies.** CI loops, monorepo installs and mirrors all count. That is why every download figure sits next to a second kind of evidence: adoption with a name and a source.
- **Private registries are invisible.** Every consumer list here is a floor.
- **The npm reverse-dependency table covers 2 of 46 packages.** The ecosyste.ms API returned a quota error for the rest. That is a measurement gap, not a conclusion.
- **Employer names from GitHub profiles are self-declared.** 35 external contributors list an employer; the rest list nothing.
- **The community is smaller than in 2020** - 97 external pull requests at the peak, 45 in 2026.
- **The bus factor is 3.** Publish rights on 46 packages with 4.37 million yearly installs sit with three people. That is the most concrete risk in this story, and it is fixable.

## What this asks for

Not more build capacity. Three things:

1. **A named owner** for Lion as ING's public web platform asset, accountable once a year against numbers rather than sentiment.
2. **Time to measure** - about a day a week: an impact dashboard for the downloads, external contributions and adoption, an internal adoption census (which ING applications depend on `@lion/ui` - that number does not exist yet), and keeping the NS and Ubisoft references current.
3. **Fix the noise that is real.** Widen the publish rights, close the two concrete points of friction NS documents (the empty-slot bug and the radio's `input type=text`) and report back. A consumer who logs your bug publicly becomes an advocate the moment it is fixed.

That is what seven years of Lion bought: one of the few places where ING's engineers contribute visibly to infrastructure other organisations run, with a community that writes more of our tests than we do. The numbers climb on their own momentum. The only thing missing is that we say so.

---

### Sources and method

All figures were measured on **7 November 2026** and are reproducible from the companion data set: the GitHub REST/GraphQL API (repository statistics, 3,238 commits, 2,224 pull requests, 613 issues, 121 discussions, 2,061 releases), the npm downloads API (46 packages, trailing twelve months and the monthly series), ecosyste.ms for npm reverse dependencies, fifteen GitHub code search queries for the consumer registry, and the consumers' own publications (NS *State of Tractie* and the `@tractie/components` changelog, Ubisoft's engineering article, the `package.json` files of Pega, Sakai, Tokens Studio, open-wc, Modern Web, TOPdesk and divriots, and the npm registry for iteratec). Contributor classification is by commit address, org membership and self-declared employer; the method and its error margin are documented with the data.
