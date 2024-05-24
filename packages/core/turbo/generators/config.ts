import type { PlopTypes } from "@turbo/gen";

// Learn more about Turborepo Generators at https://turbo.build/repo/docs/core-concepts/monorepos/code-generation

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // A simple generator to add a new React component to the internal UI library
  plop.setGenerator("react-hook", {
    description: "Adds a new react hook",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the hook?",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/hooks/{{kebabCase name}}/{{kebabCase name}}.ts",
        templateFile: "/templates/hook.hbs",
      },
      {
        type: "append",
        path: "package.json",
        pattern: /"exports": {(?<insertion>)/g,
        template: '"./{{kebabCase name}}": "./src/{{kebabCase name}}.tsx",',
      },
    ],
  });
}
