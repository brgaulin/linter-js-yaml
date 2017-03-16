'use babel';

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies
// import { CompositeDisposable } from 'atom';
import path from 'path';
import { Range } from 'atom';

export default {
  activate() {},

  deactivate() {},

  provideLinter() {
    return {
      grammarScopes: ['source.yaml', 'source.yml'],
      scope: 'file',
      name: 'YAML-Lint',
      lintsOnChange: true,
      sort: { line: false },
      lint: (TextEditor) => {
        const filePath = TextEditor.getPath();

        const maxLine = TextEditor.getLineCount() - 1;
        const messages = [];
        const messageRegex = /^.*:(\d+):(\d+): \[(error|warning)\] (.+)$/;
        const processMessage = (line) => {
          let matches = line.match(messageRegex);
          let lineNumber = +matches[1];
          // Workaround for https://github.com/nodeca/js-yaml/issues/218
          if (lineNumber > maxLine) {
            lineNumber = maxLine;
          }
          return {
            severity: matches[3],
            location: {
              file: TextEditor.getPath(),
              position: Range.fromObject([
                [lineNumber, +matches[2] - 1],
                [lineNumber, +matches[2]]
              ])
            },
            excerpt: matches[4]
          };
        };

        try {
          // messages.push(processMessage('error', 'test'))
          var exec = require('child_process').exec
          exec(`yamllint -f parsable ${filePath}`, function(error, stdout, stderr) {
            stdout.split("\n").forEach(function(line) {
              if(line == "") { return; }
              messages.push(processMessage(line))
            })
          });
        } catch (error) {
        }
        return messages;
      },
    };
  },
};
