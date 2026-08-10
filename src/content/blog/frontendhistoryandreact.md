---
title: A Tour through the history of frontend tooling and react
date: 2026-08-07
tags: meta
excerpt: My not-so-brief rambling on frontend tooling evolution and react.
---

# The Front End, Explained: From Script Tags to Vite

I've been building for the web for quite some time now, and I remember when "installing a library" meant downloading a `.min.js` file into your project folder. Today that sounds almost absurd.

Peter Jang's *Modern JavaScript Explained For Dinosaurs* remains one of the best explanations of why frontend tooling exists. Rather than teaching syntax, it walks through the problems that led to package managers, bundlers, transpilers, and task runners.

But that article was published in 2017. In frontend terms, that's ancient history. Webpack is no longer the centre of the ecosystem, Create React App has been deprecated, and React itself has changed dramatically. So let's take the same journey again briefly and then continue the story into everything that happened afterwards.

## Using JavaScript the old-school way

Let's start where the dinosaurs started. You write an HTML file, you write a JavaScript file, and you connect them with a script tag. If you wanted to use a library someone else wrote, you'd go to that library's website, download a `.min.js` file, and add a second script tag above your own, because load order was the only thing standing between you and a "`x-library is not defined`" error.

```html
<!-- jquery has to load first, or app.js breaks -->
<script src="jquery.min.js"></script>
<script src="app.js"></script>
```

This was easy to understand but miserable to live with. Every time a library shipped an update, you had to know about it, go find the new file, and download it by hand. Every new script tag was another global variable added to the browser's shared namespace, and every mistake in ordering broke the page.

## Using a package manager (npm)

<figure class="blog-figure"><img src="https://cdn.simpleicons.org/npm" alt="npm logo" /></figure>

Around 2010, package managers appeared to automate dependency management. npm eventually became the standard, even though it was originally built for Node.js rather than browsers.

Instead of downloading files manually, dependencies are listed in `package.json`, and one command installs everything into `node_modules`.

This solved version management, but not how browsers loaded those libraries. JavaScript still had no standard module system, and developers were still writing script tags.

## Using a module bundler (webpack)

<figure class="blog-figure"><img src="https://cdn.simpleicons.org/webpack" alt="webpack logo" /></figure>

Browsers originally had no way to import code from other files. Module bundlers solved that by following every `import` statement during a build and combining everything into a browser-ready bundle. Bundlers introduced the build step, opening the door to many other tools.

## Transpiling for new language features (Babel)

<figure class="blog-figure"><img src="https://cdn.simpleicons.org/babel" alt="Babel logo" /></figure>

Transpiler’s use started to let people write newer JavaScript on older browsers as browsers were not updating as fast as the language was. Arrow functions, template strings, destructuring, all the features landing in ES2015, could be written in your source and compiled down to older, safer JavaScript on build. TypeScript is also popular for adding optional static types to the same core idea.

```js
// what you write
const greet = name => `Hello, ${name}!`;

// what actually ships to older browsers
var greet = function greet(name) {
  return "Hello, " + name + "!";
};
```

Babel also then allowed Javascript XML or JSX to be possible making it easier to write React code. JSX is the HTML-like syntax React uses to describe UI, and on its own it isn't valid JavaScript. A browser has no idea what to do with a `<h1>` sitting inside a `.js` file. Write UI without it and you're calling `React.createElement` directly instead, which works fine but reads more like an API call than a description of a page:

```js
// plain JavaScript, no JSX
React.createElement('h1', null, 'Hello, world!');
```

```jsx
// the same element written as JSX
<h1>Hello, world!</h1>
```

Babel is what turns the second version into the first before any of it reaches the browser. That's mostly why a build step still shows up in nearly every React project today.

## Using a task runner (npm scripts)

By this point you had a bundler and a transpiler, both of which needed to be re-run by hand every time you changed a file. Grunt and Gulp were the early answers, but eventually npm could already run command-line tools through `package.json` scripts, so that became the standard. Dev servers with live reload also came up around this time.

And that recaps the mentioned article: package manager, bundler, transpiler, task runner. Each serving a specific purpose and each one adding its own part of configuration.

## Rebuilding the UI layer (React)

<figure class="blog-figure"><img src="https://cdn.simpleicons.org/react" alt="React logo" /></figure>

Tooling was just the beginning, though. People started wanting more complex designs and user interfaces and needing better ways to do it and there wasn't one great answer for how you should actually write the interface itself.

With vanilla JS creating something dynamic involves directly manipulating the DOM which takes a lot of effort and time. Take the example of creating a shopping cart. Adding one line item means creating every piece of markup by hand and wiring it together yourself, before you've written a single line of actual cart logic:

```js
function addCartRow(product) {
  const row = document.createElement('tr');

  const nameCell = document.createElement('td');
  nameCell.textContent = product.name;

  const priceCell = document.createElement('td');
  priceCell.textContent = `$${product.price.toFixed(2)}`;

  const removeCell = document.createElement('td');
  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';
  removeButton.addEventListener('click', () => row.remove());
  removeCell.appendChild(removeButton);

  row.append(nameCell, priceCell, removeCell);
  document.getElementById('cart-items').appendChild(row);
}
```

And it gets worse once data starts changing because the server or backend is updating data and the view needs to be updated. Say a coupon code gets applied and every price in the cart needs to update at once: now the values in the cart need to be updated, and reconciling them by hand means either writing careful, row-by-row update logic, or clearing the whole table and rebuilding it from scratch. The second option is correct but wasteful if you have to do it for something that changes often.

And that's what React solves really well, it simplifies updating the DOM and handles state and data management efficiently. By using a Virtual DOM which is a memory representation of an actual DOM and making updates on that first. It then finalises the changes to the DOM by comparing this new changed virtual version with the older one in the reconciliation phase and then applies only those parts that were changed back onto the actual DOM.

React came out of Facebook, where engineers were fighting these problems especially with Facebook's News Feed, and it was open-sourced at JSConf US in May 2013. It was not well received at first. Mixing markup directly into JavaScript, via JSX, felt like a violation of everything anyone had been taught about keeping structure and logic apart.

But it stuck and mainly for four reasons:

- You describe what the UI should look like for a given state, and React works out the update itself, instead of you writing the transition by hand.
- Your logic and your state all live together in one reusable component instead of being spread across a template and a controller.
- A virtual DOM, an in-memory copy of the real page, gets diffed against the previous version so only the minimal actual change gets applied, which is what makes "just re-render the whole thing" a workable idea instead of a performance disaster.
- Data flows one way, down from parent to child, with events flowing back up, so when something's wrong there's exactly one direction to trace it.

> **Note:** React calls itself a library and not a framework. It renders UI and does not do routing, data fetching, build tooling, or have any opinion about how your folders should look. That's simultaneously its best feature, since you can pair it with whatever else you want, and it's biggest difficulty. (Too much freedom means more complications)

Hooks arrived in 2019 and were the second wave of the same idea, letting function components hold their own state and side effects. This killed class components almost overnight and got rid of a lot of the wrapper-component gymnastics people had built up trying to share logic between components.

## Choosing from React, Angular, and Vue

<figure class="blog-figure blog-figure--row">
  <img src="https://cdn.simpleicons.org/react" alt="React logo" />
  <img src="https://cdn.simpleicons.org/angular" alt="Angular logo" />
  <img src="https://cdn.simpleicons.org/vuedotjs" alt="Vue logo" />
</figure>

People compare these three constantly and the main consideration to look out for is how many decisions each one makes on your behalf.

### Angular

Angular makes a lot of decisions for you. Modern Angular, the 2016 rewrite, not the original AngularJS, ships routing, HTTP handling, forms, dependency injection, a testing setup, and a CLI, together as a part of the framework and even TypeScript is not optional. This is particularly helpful for larger teams with long term projects where consistency is easier to achieve because of all the rules especially because there is one Angular way to do most things, so code a different team wrote five years ago is still understandable and constrained. The downside though is that it requires a steep learning curve and more ceremony before you can start building anything at all.

### React

React makes very few decisions for you. It decides how components render and leaves routing, state management, data fetching, and forms entirely up to you. That flexibility built somewhat of the largest ecosystem in the front end world, which now is also the biggest reason for React's popularity: whatever library you need probably already exists. The tradeoff for this is decision fatigue and how many considerations it takes to decide on how to structure and build a React project. On top of that, the complexity around Server Components and the meta-framework layer has made starting out with React a bit more complicated.

### Vue

Vue sits somewhere in between. It uses single-file components to keep your template, script, and styles together in one file, in a syntax that stays close to plain HTML. The core team also maintains an official router and state library without forcing you to use them. It's considered somewhat easier to pick up but at the cost of a smaller ecosystem and a smaller hiring pool.

It's worth mentioning Svelte also. It compiles your components away at build time, so there's barely any framework left running in the browser. It consistently posts the high developer-satisfaction scores among users when compared with the other options.

For what it's worth, the 2025 Stack Overflow Developer Survey put React's usage among professional developers at around 45%, with Angular and Vue each around 18% and Svelte around 7%.

## From Create React App to Modern React

### Create React App Solved Setup

Back in 2016, starting a React project meant assembling webpack, Babel, a JSX transform, a development server, and hot reloading yourself before writing a single line of your actual application. Adding React to an existing project was a little simpler, you could add it through npm or even a script tag, but starting a brand-new React app from scratch had no obvious path.

Most developers relied on boilerplate repositories. These bundled together a working configuration, but they quickly became outdated, and pulling in upstream improvements without breaking your own customizations was often more work than starting over.

Create React App (CRA) fixed that by packaging the common tooling into a single command. It hid the complexity of configuring webpack and Babel, provided sensible defaults, and quietly managed the incompatibilities between the various tools underneath. There was now one obvious way to start a React project.

```bash
npx create-react-app my-app
cd my-app
npm start
```

That simplicity made Create React App enormously influential. Updating one package also updated most of the underlying tooling, making React much easier for beginners to get started with.

The biggest usage complaint was the `eject` command. If you needed to customize the hidden webpack configuration, you had to eject, permanently exposing the entire configuration into your project and pushing responsibility for maintaining it onto yourself. Tools like `react-app-rewired` and CRACO became popular almost entirely because they let developers work around ejecting.

### Create React App Solved the Wrong Problem

The biggest limitation of Create React App was the kind of application it encouraged you to build.

Every CRA application was a fully client-rendered single-page application. The server sent little more than an HTML file containing a script tag. The browser then had to download React, download your application, execute all of that JavaScript, and only then begin requesting the data the page actually needed.

Until that process finished, users often saw little more than a blank page.

If components fetched their own data when they mounted, those requests frequently happened one after another instead of in parallel, creating the "waterfall" loading effect that React developers are familiar with.

These weren't issues caused by using webpack or certain tools but more architectural problems involving rendering, routing, and data loading. And frameworks approached those problems differently. A server-rendered framework can begin loading data as soon as the request reaches the server, while a static site generator performs much of that work ahead of time during the build. In both cases, the browser receives meaningful HTML immediately instead of waiting for JavaScript before anything appears on the screen.

Replacing webpack with a faster bundler never addressed those issues because the bottleneck was where and when the application rendered.

That is why, when the React team officially deprecated Create React App, they recommended using a framework rather than simply switching to another build tool.

Frameworks such as Next.js, Remix, and React Router combine rendering, routing, and data loading into one cohesive system. They solve the architectural problems that Create React App intentionally left to the developer.

The final push came with React 19. A fresh Create React App installation no longer worked because of dependency incompatibilities, meaning beginners following older tutorials often encountered errors before writing their first component. On February 14, 2025, the React team officially deprecated Create React App, recommending either a framework such as Next.js, React Router, or Expo, or a modern build tool like Vite, Parcel, or Rsbuild when a framework wasn't necessary. Create React App still exists in maintenance mode today, but creating a new project now displays a deprecation warning.

## Where Vite Fits

<figure class="blog-figure"><img src="https://cdn.simpleicons.org/vite" alt="Vite logo" /></figure>

Not every React application needs server rendering. Internal dashboards, admin panels, and applications that live entirely behind a login generally don't benefit from SEO or from sending fully rendered HTML before JavaScript loads. For those kinds of applications, a traditional client-rendered SPA is still an excellent fit.

Today, that usually means using Vite.

Vite, whose name comes from the French word for "quick", was created by Evan You, the creator of Vue. It is often described as "webpack, but faster," although the bigger difference is that it treats development and production as two completely different problems.

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm run dev
```

Traditional bundlers handle development and production in much the same way. They crawl the dependency graph, bundle everything together, and then serve the result. That makes perfect sense for production, where you want one optimized bundle, but during development most of that work is unnecessary because you've usually only changed a single file.

Vite separates those concerns. Your dependencies change infrequently, so they're pre-bundled once using a fast native tool and then cached. This also smooths over the many npm packages that still ship as CommonJS rather than ES modules. Your own source code changes constantly, so Vite doesn't bundle it during development at all. Instead, it serves files directly as native ES modules and only transforms them when the browser requests them.

Because the browser handles module loading itself, the development server starts almost instantly regardless of project size. Hot Module Replacement also updates only the files you've changed rather than rebuilding large portions of the application, making the feedback loop noticeably faster as projects grow.

Production is different. Browsers aren't particularly efficient at downloading hundreds of separate JavaScript modules over the network, so Vite still creates an optimized production bundle with tree-shaking, code splitting, and hashed filenames. Development and production have different priorities and so Vite deliberately uses different pipelines for each.

## Vite Today

For years, Vite used different engines for development and production, which occasionally meant subtle differences only appeared after deployment.

Vite 8 addressed that by moving both pipelines onto Rolldown, a Rust-based bundler with a Rollup-compatible plugin API, while Oxc handles parsing and code transformations underneath. Besides significantly faster builds, the larger benefit is consistency: development and production now behave much more alike, eliminating an entire class of bugs that previously only surfaced after building the application.

Today, Vite has become the default build tool across much of the frontend ecosystem. It powers projects built with Vue, Svelte, Astro, Nuxt, Remix, React Router, and even Angular's modern build pipeline. It is downloaded well over 100 million times each week, and in 2026 Cloudflare acquired VoidZero, the company behind Vite, Rolldown, Vitest, and Oxc, while committing to keep the projects open source and vendor-neutral.

## Conclusion

So that's the tour. We started with plain HTML and JavaScript loaded through script tags, then added npm so we no longer had to download libraries by hand. Bundlers solved the problem of using imports in the browser, transpilers let us write newer JavaScript before browsers supported it, and task runners tied all of those tools together. From there we moved to React's component-based way of building interfaces, looked at how it compares with Angular and Vue, and finally saw how the tooling itself evolved from Create React App and webpack to Vite and modern frameworks like Next.js.

If you're learning all of this for the first time, it can feel like frontend development changes every few months. In reality, things have settled down much more than they used to. npm is the standard package manager. ES modules are the standard way to organize code. Vite, or a framework like Next.js is now the default starting point for most projects. Every major framework also ships with a CLI that sets everything up for you, so you rarely have to think about the build tooling unless you want to.

None of these tools appeared out of nowhere, though. Every one of them exists because developers kept running into the same problem often enough that someone decided to solve it. npm solved dependency management. Bundlers solved browser compatibility. Transpilers let developers use new language features earlier. Frameworks solved larger architectural problems around rendering and routing. Vite improved the developer experience without changing how applications actually work.

That is probably the most useful lesson to take away from all of this, and it's the same point the original "JavaScript Fatigue" article was making back in 2017. New tools will keep appearing, just as they always have. Before adopting one, the important question is not how many stars it has on GitHub or how impressive the benchmark numbers look. The better question is much simpler: what problem is this actually solving? If you cannot answer that, you probably do not need it yet.

## References


- [Modern JavaScript Explained For Dinosaurs](https://medium.com/the-node-js-collection/modern-javascript-explained-for-dinosaurs-f695e9747b70) — Peter Jang, the piece this whole post is modeled on
- [Sunsetting Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app) — the official React team announcement; this is the same post whose reasoning you pasted in and asked me to draw from for the CRA/Vite section
- [Why Vite](https://vite.dev/guide/why) — Vite's own architectural rationale
- [Stack Overflow 2025 Developer Survey](https://survey.stackoverflow.co/2025)
- [Announcing Vite 8](https://vite.dev/blog/announcing-vite8) — official release post, source for the Rolldown/10-30x/March 2026 claims
- [VoidZero is joining Cloudflare](https://blog.cloudflare.com/voidzero-joins-cloudflare/) — official Cloudflare blog post, source for the June 2026 acquisition paragraph