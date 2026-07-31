/// <reference types="vite/client" />

// Declares the ambient module types for Vite's asset imports — notably the
// side-effect `import "./foo.css"` that each component uses to pull in its
// stylesheet. Without this the editor flags every one of them.
