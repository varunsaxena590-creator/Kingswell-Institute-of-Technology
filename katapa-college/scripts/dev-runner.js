const { spawn } = require("child_process");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const withDb = process.argv.includes("--with-db");
const children = [];
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
  });

  const prefix = `[${name}]`;

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`${prefix} ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`${prefix} ${chunk}`);
  });

  child.on("exit", (code) => {
    const normalizedCode = code ?? 0;
    process.stdout.write(`${prefix} exited with code ${normalizedCode}\n`);
  });

  children.push(child);
  return child;
}

if (withDb) {
  run(
    "DB",
    "powershell",
    ["-ExecutionPolicy", "Bypass", "-File", ".\\scripts\\start-db.ps1"],
    rootDir
  );
}

run("BACKEND", npmCommand, ["start"], path.join(rootDir, "backend"));
run("FRONTEND", npmCommand, ["run", "dev", "--", "--host", "127.0.0.1"], path.join(rootDir, "frontend"));

function shutdown() {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
