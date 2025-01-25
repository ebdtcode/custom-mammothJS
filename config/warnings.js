const IGNORED_WARNINGS = [
  {
    type: "warning",
    pattern: /^Unrecognised paragraph style: 'Body'/,
  },
  {
    type: "warning",
    pattern: /^Unrecognised paragraph style: 'Table Header Row'/,
  },
  {
    type: "warning",
    pattern: /^Unrecognised run style: 'Heading 3 Char'/,
  },
  {
    type: "warning",
    pattern: /^Unrecognised paragraph style: 'Table Data'/,
  },
  {
    type: "warning",
    pattern: /^Unrecognised paragraph style: 'Table\/Graphic Header'/,
  },
];

module.exports = { IGNORED_WARNINGS };
