import fs from "fs";
import path from "path";

// Load your actual app HTML template once before tests
const html = fs.readFileSync(
  path.resolve(__dirname, "./src/template.html"),
  "utf8",
);
document.documentElement.innerHTML = html;
