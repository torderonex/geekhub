export enum LANGUAGE_SNIPPETS {
  javascript = `function greet(name) {\n\tconsole.log("I am " + name + "! JS");\n}\n\ngreet("compiler");`,
  go = `package main\n\nimport "fmt"\n\nfunc greet(name string) {\n\tfmt.Println("I am " + name + "! Go")\n}\n\nfunc main() {\n\tgreet("compiler")\n}`,
  python = `def greet(name):\n\tprint("I am " + name + "! PY")\n\ngreet("compiler")`,
  cpp = `#include <iostream>\n\nvoid greet(std::string name) {\n\tstd::cout << "I am " << name << "! C++" << std::endl;\n}\n\nint main() {\n\tgreet("compiler");\n\treturn 0;\n}`,
}
