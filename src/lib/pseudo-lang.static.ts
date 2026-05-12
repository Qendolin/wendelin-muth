export default {
  $schema: 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',
  name: 'pseudo',
  scopeName: 'source.pseudocode',
  fileTypes: ['pseudo'],

  patterns: [
    { include: '#comment' },
    { include: '#function-declaration' },
    { include: '#return-statement' },
    { include: '#control-flow' },
    { include: '#loop-keywords' },
    { include: '#action-keywords' },
    { include: '#builtin-constants' },
    { include: '#boolean-test' },
    { include: '#set-operators' },
    { include: '#assignment-operator' },
    { include: '#comparison-operators' },
    { include: '#arithmetic-operators' },
    { include: '#function-call' },
    { include: '#number' },
    { include: '#subscript-identifier' },
    { include: '#identifier' },
    { include: '#punctuation-colon' },
    { include: '#punctuation-comma' },
    { include: '#brackets' }
  ],

  repository: {
    comment: {
      name: 'comment.line.double-slash.pseudocode',
      match: '//.*$'
    },

    'function-declaration': {
      name: 'meta.function.pseudocode',
      match: '\\b(function)\\s+([A-Za-z_][A-Za-z0-9_]*)\\s*(?=\\()',
      captures: {
        '1': { name: 'keyword.declaration.function.pseudocode' },
        '2': { name: 'entity.name.function.pseudocode' }
      }
    },

    'return-statement': {
      name: 'keyword.control.return.pseudocode',
      match: '\\breturn\\b'
    },

    'control-flow': {
      patterns: [
        {
          name: 'keyword.control.conditional.pseudocode',
          match: '\\b(if|else)\\b'
        },
        {
          name: 'keyword.control.break.pseudocode',
          match: '\\bbreak\\b'
        }
      ]
    },

    'loop-keywords': {
      patterns: [
        {
          name: 'keyword.control.loop.pseudocode',
          match: '\\bloop\\b'
        },
        {
          name: 'keyword.control.loop.modifier.pseudocode',
          match: '\\bindefinitely\\b'
        }
      ]
    },

    'action-keywords': {
      patterns: [
        {
          name: 'keyword.operator.action.pseudocode',
          match: '\\b(add|remove|Split|let|be|new)\\b'
        },
        {
          name: 'keyword.operator.in.pseudocode',
          match: '\\bin\\b'
        },
        {
          name: 'keyword.operator.to.pseudocode',
          match: '\\bto\\b'
        }
      ]
    },

    'builtin-constants': {
      patterns: [
        {
          name: 'constant.language.fail.pseudocode',
          match: '\\bFAIL\\b'
        },
        {
          name: 'constant.language.null.pseudocode',
          match: '\\bnull\\b'
        },
        {
          name: 'constant.language.empty.pseudocode',
          match: '\\bempty\\b'
        },
        {
          name: 'constant.language.boolean.pseudocode',
          match: '\\b(true|false)\\b'
        }
      ]
    },

    'boolean-test': {
      name: 'meta.test-call.pseudocode',
      match: '(\\btest\\b)\\s*(\\()',
      captures: {
        '1': { name: 'support.function.builtin.pseudocode' },
        '2': { name: 'punctuation.definition.arguments.begin.pseudocode' }
      }
    },

    'set-operators': {
      patterns: [
        {
          comment: 'Set union: ∪',
          name: 'keyword.operator.set.union.pseudocode',
          match: '∪'
        },
        {
          comment: 'Set difference: \\',
          name: 'keyword.operator.set.difference.pseudocode',
          match: '(?<![a-zA-Z0-9_])\\\\(?![\\\\])'
        },
        {
          comment: 'Set membership: ∈',
          name: 'keyword.operator.set.membership.pseudocode',
          match: '∈'
        },
        {
          comment: 'Set not-membership: ∉',
          name: 'keyword.operator.set.not-membership.pseudocode',
          match: '∉'
        },
        {
          comment: 'Subset: ⊆',
          name: 'keyword.operator.set.subset.pseudocode',
          match: '⊆'
        }
      ]
    },

    'assignment-operator': {
      comment: 'Left arrow assignment ←',
      name: 'keyword.operator.assignment.pseudocode',
      match: '←'
    },

    'comparison-operators': {
      patterns: [
        {
          name: 'keyword.operator.comparison.pseudocode',
          match: '\\bis\\b'
        },
        {
          name: 'keyword.operator.comparison.negation.pseudocode',
          match: '\\bis not\\b'
        },
        {
          name: 'keyword.operator.relational.pseudocode',
          match: '[≠≤≥<>]|(?<!=)=(?!=)'
        }
      ]
    },

    'arithmetic-operators': {
      name: 'keyword.operator.arithmetic.pseudocode',
      match: '[+\\-*÷/]'
    },

    'function-call': {
      name: 'meta.function-call.pseudocode',
      match: '\\b([A-Za-z_][A-Za-z0-9_]*)\\s*(?=\\()',
      captures: {
        '1': { name: 'entity.name.function.call.pseudocode' }
      }
    },

    number: {
      name: 'constant.numeric.pseudocode',
      match: '\\b[0-9]+(?:\\.[0-9]+)?\\b'
    },

    'subscript-identifier': {
      comment: 'Identifiers ending in Unicode subscript digits or letters, e.g. C₁, C₂, Aₙ',
      name: 'variable.other.subscript.pseudocode',
      match: '[A-Za-z_][A-Za-z0-9_]*[₀₁₂₃₄₅₆₇₈₉ₐₑₒₓₙₘₖⱼᵢ]+'
    },

    identifier: {
      patterns: [
        {
          comment: 'ALL_CAPS identifiers treated as named constants / formal parameters',
          name: 'variable.other.constant.pseudocode',
          match: '\\b[A-Z][A-Z0-9_]{1,}\\b'
        },
        {
          comment: 'CamelCase identifiers — typically algorithm-level variables or set names',
          name: 'variable.other.camelcase.pseudocode',
          match: '\\b[A-Z][a-z][A-Za-z0-9_]*\\b'
        },
        {
          comment: 'Lower-case plain identifiers — local variables',
          name: 'variable.other.pseudocode',
          match: '\\b[a-z_][a-zA-Z0-9_]*\\b'
        }
      ]
    },

    'punctuation-colon': {
      name: 'punctuation.terminator.statement.pseudocode',
      match: ':'
    },

    'punctuation-comma': {
      name: 'punctuation.separator.comma.pseudocode',
      match: ','
    },

    brackets: {
      patterns: [
        {
          name: 'punctuation.definition.parameters.begin.pseudocode',
          match: '\\('
        },
        {
          name: 'punctuation.definition.parameters.end.pseudocode',
          match: '\\)'
        },
        {
          name: 'punctuation.definition.set.begin.pseudocode',
          match: '\\{'
        },
        {
          name: 'punctuation.definition.set.end.pseudocode',
          match: '\\}'
        },
        {
          name: 'punctuation.definition.array.begin.pseudocode',
          match: '\\['
        },
        {
          name: 'punctuation.definition.array.end.pseudocode',
          match: '\\]'
        }
      ]
    }
  }
};
