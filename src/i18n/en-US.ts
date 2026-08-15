/**
 * English dictionary. Type-checked against zh-CN: every key must exist.
 */
import type { Dict } from './index';

export const enUS: Dict = {
  appName: 'CodeVision Lab',
  appNameEn: 'CodeVision Lab',
  tagline: 'Interactive programming & algorithm visualization platform',

  nav: {
    home: 'Home',
    roadmap: 'Roadmap',
    lessons: 'Language Courses',
    dataStructures: 'Data Structures',
    algorithms: 'Algorithms',
    lab: 'Playground',
    exercises: 'Exercises',
    progress: 'Progress',
    menu: 'Open menu',
    closeMenu: 'Close menu',
  },

  theme: {
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode',
  },
  lang: {
    toggle: '将界面切换为中文',
    label: 'English',
  },

  common: {
    start: 'Start',
    learn: 'Start learning',
    play: 'Play',
    pause: 'Pause',
    prevStep: 'Prev step',
    nextStep: 'Next step',
    reset: 'Reset',
    jumpStart: 'Jump to start',
    jumpEnd: 'Jump to end',
    speed: 'Speed',
    autoplay: 'Autoplay',
    randomize: 'Random data',
    applyInput: 'Apply input',
    confirm: 'OK',
    cancel: 'Cancel',
    close: 'Close',
    search: 'Search',
    clear: 'Clear',
    favorite: 'Favorite',
    unfavorite: 'Unfavorite',
    completed: 'Completed',
    inProgress: 'In progress',
    notStarted: 'Not started',
    copy: 'Copy',
    copied: 'Copied',
    share: 'Share link',
    back: 'Back',
    loading: 'Loading…',
    retry: 'Retry',
    skipToContent: 'Skip to main content',
    empty: 'Nothing here yet',
    step: 'step',
    difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
    codeLang: { cpp: 'C++', csharp: 'C#', python: 'Python' },
  },

  home: {
    badge: 'Algorithm lab keeps growing · roadmap & 3-language courses live',
    heroTitle: 'Understand every line, see every computation',
    heroSubtitle:
      'An interactive visualization platform for C++, C# and Python learners: step through, rewind, and change inputs with code and animation in perfect sync.',
    heroCta: 'Open bubble sort demo',
    heroCta2: 'Browse the roadmap',
    languagesTitle: 'Three language tracks',
    languagesDesc:
      'From Hello World to advanced features — variables, memory and execution made visible.',
    algorithmsTitle: 'Algorithm visualizations',
    algorithmsDesc:
      'Sorting, searching, graphs, dynamic programming… every step visible and rewindable.',
    feature1Title: 'One step, one snapshot',
    feature1Desc:
      'Every execution step is a complete state snapshot; stepping back never re-executes in reverse — results stay deterministic.',
    feature2Title: 'Code & animation in sync',
    feature2Desc:
      'Example code in three languages is highlighted line-by-line in sync with execution; switching languages never misaligns.',
    feature3Title: 'A lab with editable data',
    feature3Desc:
      'Custom inputs, random generation and boundary cases — watch how algorithms behave on edge inputs.',
    feature4Title: 'Local progress saving',
    feature4Desc:
      'Progress, favorites, theme and preferences are saved in your browser and survive refreshes.',
    roadmapTitle: 'Start your path from the skill tree',
    roadmapDesc:
      'A knowledge graph with prerequisite edges: green = easy, yellow = medium, red = hard.',
  },

  panels: {
    variables: 'Variables',
    containers: 'Data state',
    pointers: 'Pointers',
    callStack: 'Call stack',
    input: 'Standard input',
    output: 'Standard output',
    errors: 'Errors',
    stats: 'Operation stats',
    complexity: 'Complexity',
    explanation: 'Step explanation',
    pseudocode: 'Pseudocode',
    mistakes: 'Common mistakes & edge cases',
    recursionDepth: 'Recursion depth',
    empty: 'No data',
  },

  stats: {
    comparisons: 'Comparisons',
    swaps: 'Swaps',
    accesses: 'Accesses',
    writes: 'Writes',
  },

  complexity: {
    time: 'Time complexity',
    space: 'Space complexity',
    best: 'Best',
    average: 'Average',
    worst: 'Worst',
  },

  playback: {
    status: { idle: 'Idle', playing: 'Playing', paused: 'Paused', finished: 'Finished' },
    stepOf: 'Step {current} / {total}',
    speedLabel: 'Animation speed',
    speedUnit: 'steps/s',
  },

  playground: {
    inputLabel: 'Input data',
    inputPlaceholder: 'Enter an array, e.g. 5, 3, 8, 1, 9',
    inputPlaceholderTree: 'Enter a level-order tree, e.g. 1, 2, 3, null, 4, 5',
    inputPlaceholderEdge: 'Enter edges, e.g. 0-1, 0-2, 1-3',
    inputNotNeeded: 'This algorithm takes no array input — just set the parameter',
    presetCases: 'Preset cases',
    boundaryCases: 'Boundary cases',
    customInput: 'Custom input',
    dataSize: 'Data size',
    elements: '{count} elements',
    shareCopied: 'Link copied — share it to open the same case.',
    shortcutHelp: 'Keyboard shortcuts',
    shortcuts: {
      space: 'Play / pause',
      prev: 'Previous step',
      next: 'Next step',
      reset: 'Reset',
      start: 'Jump to start',
      end: 'Jump to end',
      random: 'Random data',
      slower: 'Slower',
      faster: 'Faster',
    },
    demoMode: 'Demo mode',
    tabs: { intro: 'Intro', code: 'Code', viz: 'Visual', state: 'State' },
    demoModeNote:
      'This demo is generated step-by-step by a built-in deterministic execution simulator that faithfully reflects real execution; C++ and C# cannot be compiled in the browser yet.',
    codeLangLabel: 'Sample code language',
    caseImported: 'Case data imported.',
    importFailed: 'Import failed: invalid data format.',
    importCase: 'Import case',
    importPlaceholder: 'Paste a shared link, or type data directly (e.g. 5, 3, 8, 1)',
  },

  errors: {
    invalidArray: 'Invalid input: comma-separated integers expected, e.g. 5, 3, 8, 1',
    emptyInput: 'Input cannot be empty',
    tooManyItems: 'Too many items (max {max})',
    outOfRange: 'Values must be between {min} and {max}',
    pageNotFound: 'Page not found or moved',
    backHome: 'Back to home',
    somethingWrong: 'Something went wrong, please refresh.',
    runnerFailed: 'Algorithm run failed: {message}',
  },

  roadmap: {
    title: 'Learning roadmap',
    subtitle: 'Drag to pan, scroll to zoom, click a node to learn. Colors show difficulty.',
    fitView: 'Fit view',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetView: 'Reset view',
    searchPlaceholder: 'Search nodes…',
    legend: 'Difficulty legend',
    prerequisites: 'Prerequisites',
    goToLesson: 'Start learning',
    goToAlgorithm: 'Open visualization',
    locked: 'Locked',
    nodes: '{count} nodes',
    noResult: 'No matching nodes',
  },

  algorithms: {
    title: 'Algorithm visualizations',
    subtitle: 'Pick an algorithm and enter an interactive, step-by-step, editable demo.',
    searchPlaceholder: 'Search algorithms…',
    allCategories: 'All categories',
    startDemo: 'Start demo',
    done: 'Done',
    lastInput: 'Last input',
    categories: {
      array: 'Array',
      'basic-structure': 'Basic structures',
      sorting: 'Sorting',
      searching: 'Searching',
      'two-pointers': 'Two pointers',
      'sliding-window': 'Sliding window',
      stack: 'Stack',
      queue: 'Queue',
      'linked-list': 'Linked list',
      tree: 'Binary tree',
      graph: 'Graph',
      dp: 'Dynamic programming',
      backtracking: 'Backtracking',
      greedy: 'Greedy',
    },
  },

  lessons: {
    title: 'Language courses',
    subtitle: 'Systematic C++, C# and Python courses: concepts, examples, live demos, exercises.',
    comingNote: 'First lessons are live (blue links) on top of the full chapter structure; more lessons keep landing with each iteration.',
  },

  progress: {
    title: 'Learning progress',
    subtitle: 'Progress is saved in your browser and survives refreshes.',
    algorithmsDone: 'Algorithms completed',
    lessonsDone: 'Lessons completed',
    favorites: 'My favorites',
    recentTitle: 'Recently learned',
    empty: 'No records yet — start from the home page or roadmap.',
    overall: 'Overall progress',
  },

  lab: {
    title: 'Playground',
    subtitle: 'Write and run code here.',
    python: {
      name: 'Python 3 (real execution)',
      desc: 'Code runs for real inside a Web Worker via Pyodide; output and errors return live.',
      run: 'Run',
      loading: 'Loading Python runtime (first time: ~10–30 s)…',
      ready: 'Runtime ready',
      notReady: 'Runtime not loaded',
      stdout: 'Standard output',
      result: 'Result',
      runtimeError: 'Runtime error',
      timeout: 'Execution timed out (10 s)',
      loadFailed: 'Failed to load the Python runtime. Check your network and retry.',
      example:
        '# Try editing this code\nprint("Hello, CodeVision Lab!")\nfor i in range(5):\n    print(f"{i} squared = {i*i}")',
    },
    csharp: {
      name: 'C# (demo mode)',
      desc: 'C# cannot be compiled in the browser yet — open “Algorithms” for step-by-step C# examples.',
    },
    cpp: {
      name: 'C++ (demo mode)',
      desc: 'C++ cannot be compiled in the browser yet — open “Algorithms” for step-by-step C++ examples.',
    },
  },

  exercises: {
    title: 'Exercises',
    subtitle: 'Every lesson and algorithm ships with small exercises and answers, growing with the content.',
    empty: 'Exercises are being added with course content; experiment in the algorithm lab meanwhile.',
  },

  footer: {
    note: 'CodeVision Lab · progress & preferences are stored locally in your browser',
    links: 'Related links',
    blog: 'Back to geography blog',
  },
};
