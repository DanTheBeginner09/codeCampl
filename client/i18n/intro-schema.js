/* eslint-disable camelcase */
/* This is used for testing. If an intro.json file doesn't match the
 * structure here exactly, the tests will fail.
 */
const introSchema = {
  'responsive-web-design': {
    title: 'Responsive Web Design',
    intro: [
      "In the Responsive Web Design Certification, you'll learn the languages that developers use to build webpages: HTML (Hypertext Markup Language) for content, and CSS (Cascading Style Sheets) for design.",
      "First, you'll build a cat photo app to learn the basics of HTML and CSS. Later, you'll learn modern techniques like CSS variables by building a penguin, and best practices for accessibility by building a web form.",
      "Finally, you'll learn how to make webpages that respond to different screen sizes by building a Twitter card with Flexbox, and a complex blog layout with CSS Grid."
    ],
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/building_websites_i78t.svg',
    blocks: {
      'basic-html-and-html5': {
        title: 'Basic HTML and HTML5',
        intro: [
          'HTML is a markup language that is used to describe the structure of a webpage.',
          "In this course, you'll build a cat photo app to learn some of the most common HTML elements — the building blocks of any webpage."
        ]
      },
      'basic-css': {
        title: 'Basic CSS',
        intro: [
          'CSS, or Cascading Style Sheets, tell the browser how to display the text and other content that you write in HTML. With CSS, you can control the color, font, size, spacing, and many other aspects of HTML elements.',
          "Now that you've described the structure of your cat photo app, give it some style with CSS."
        ]
      },
      'applied-visual-design': {
        title: 'Applied Visual Design',
        intro: [
          'Visual design is a combination of typography, color theory, graphics, animation, page layout, and more to help deliver your unique message.',
          "In this course, you'll learn how to apply these different elements of visual design to your webpages."
        ]
      },
      'applied-accessibility': {
        title: 'Applied Accessibility',
        intro: [
          'In web development, accessibility refers to web content and a UI (user interface) that can be understood, navigated, and interacted with by a broad audience. This includes people with visual, auditory, mobility, or cognitive disabilities.',
          "In this course, you'll best practices for building webpages that are accessible to everyone."
        ]
      },
      'responsive-web-design-principles': {
        title: 'Responsive Web Design Principles',
        intro: [
          'There are many devices that can access the web, and they come in all shapes and sizes. Responsive web design is the practice of designing flexible websites that can respond to different screen sizes, orientations, and resolutions.',
          "In this course, you'll learn how to use CSS to make your webpages look good, no matter what device they're viewed on."
        ]
      },
      'css-flexbox': {
        title: 'CSS Flexbox',
        intro: [
          "Flexbox is a powerful, well-supported layout method that was introduced with the latest version of CSS, CSS3. With flexbox, it's easy to center elements on the page and create dynamic user interfaces that shrink and expand automatically.",
          "In this course, you'll learn the fundamentals of flexbox and dynamic layouts by building a Twitter card."
        ]
      },
      'css-grid': {
        title: 'CSS Grid',
        intro: [
          'The CSS grid is a newer standard that makes it easy to build complex responsive layouts. It works by turning an HTML element into a grid, and lets you place child elements anywhere within.',
          "In this course, you'll learn the fundamentals of CSS grid by building different complex layouts, including a blog."
        ]
      }
    }
  },
  'javascript-algorithms-and-data-structures': {
    title: 'JavaScript Algorithms and Data Structures',
    intro: [
      "While HTML and CSS control the content and styling of a page, JavaScript is used to make it interactive. In the JavaScript Algorithm and Data Structures Certification, you'll learn the fundamentals of JavaScript including variables, arrays, objects, loops, and functions.",
      "Once you have the fundamentals down, you'll apply that knowledge by creating algorithms to manipulate strings, factorialize numbers, and even calculate the orbit of the International Space Station.",
      "Along the way, you'll also learn two important programing styles or paradigms: Object Oriented Programing (OOP), and Functional Programing (FP)."
    ],
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/dev_focus_b9xo.svg',
    blocks: {
      'basic-javascript': {
        title: 'Basic JavaScript',
        intro: ['Intro text 1', 'Intro text 2']
      },
      es6: {
        title: 'ES6',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'regular-expressions': {
        title: 'Regular Expressions',
        intro: ['Intro text 1', 'Intro text 2']
      },
      debugging: {
        title: 'Debugging',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'basic-data-structures': {
        title: 'Basic Data Structures',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'object-oriented-programming': {
        title: 'Object Oriented Programming',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'functional-programming': {
        title: 'Functional Programming',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'intermediate-algorithm-scripting': {
        title: 'Intermediate Algorithm Scripting',
        intro: ['Intro text 1', 'Intro text 2']
      }
    }
  },
  'front-end-libraries': {
    title: 'Front End Libraries',
    intro: [
      "Now that you're familiar with HTML, CSS, and JavaScript, level up your skills by learning some of the most popular front end libraries in the industry.",
      "In the Front End Libraries Certification, you'll learn how to style your site quickly with Bootstrap. You'll also learn how add logic to your CSS styles and extend them with Sass. Later, you'll build a shopping cart and other applications to learn how to create powerful Single Page Applications (SPAs) with React and Redux."
    ],
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/react_y7wq.svg',
    blocks: {
      bootstrap: {
        title: 'Bootstrap',
        intro: ['Intro text 1', 'Intro text 2']
      },
      jquery: {
        title: 'jQuery',
        intro: ['Intro text 1', 'Intro text 2']
      },
      sass: {
        title: 'SASS',
        intro: ['Intro text 1', 'Intro text 2']
      },
      react: {
        title: 'React',
        intro: ['Intro text 1', 'Intro text 2']
      },
      redux: {
        title: 'Redux',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'react-and-redux': {
        title: 'React and Redux',
        intro: ['Intro text 1', 'Intro text 2']
      }
    }
  },
  'data-visualization': {
    title: 'Data Visualization',
    intro: [
      "Data is all around us, but it doesn't mean much without shape or context.",
      "In the Data Visualization Certification, you'll build charts, graphs, and maps to present different types of data with the D3.js library.",
      "You'll also learn about JSON (JavaScript Object Notation), and how to work with data online using an API (Application Programing Interface)."
    ],
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Data_re_80ws.svg',
    blocks: {
      'data-visualization-with-d3': {
        title: 'Data Visualization with D3',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'json-apis-and-ajax': {
        title: 'JSON APIs and AJAX',
        intro: ['Intro text 1', 'Intro text 2']
      }
    }
  },
  'apis-and-microservices': {
    title: 'APIs and Microservices',
    intro: [
      "Until this point, you've only used JavaScript on the front end to add interactivity to a page, solve algorithm challenges, or build an SPA. But JavaScript can also be used on the back end, or server, to build entire web applications.",
      'Today, one of the popular ways to build applications is through microservices, which are small, modular applications that work together to form a larger whole.',
      "In the APIs and Microservices Certification, you'll learn how to write back end-ready with Node.js and NPM (Node Package Manager). You'll also build web applications with the Express framework, and build a People Finder microservice with MongoDB and the Mongoose library."
    ],
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/server_status_5pbv.svg',
    blocks: {
      'managing-packages-with-npm': {
        title: 'Managing Packages with NPM',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'basic-node-and-express': {
        title: 'Basic Node and Express',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'mongodb-and-mongoose': {
        title: 'MongoDB and Mongoose',
        intro: ['Intro text 1', 'Intro text 2']
      }
    }
  },
  'quality-assurance': {
    title: 'Quality Assurance',
    intro: [
      "As your programs or web applications become more complex, you'll want to test them to make sure that new changes don't break their original functionality.",
      "In the Quality Assurance Certification, you'll learn how to write to write tests with Chai and Mocha to ensure your applications work the way you expect them to.",
      "Then you'll build a chat application to learn advanced Node and Express concepts. You'll also use Pug as a template engine, Passport for authentication, Socket.io for real-time communication between the server and connected clients."
    ],
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/usability_testing_2xs4.svg',
    blocks: {
      'quality-assurance-and-testing-with-chai': {
        title: 'Quality Assurance and Testing with Chai',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'advanced-node-and-express': {
        title: 'Advanced Node and Express',
        intro: ['Intro text 1', 'Intro text 2']
      }
    }
  },
  'scientific-computing-with-python': {
    title: 'Scientific Computing with Python',
    intro: [
      'Python is one of the most popular, flexible programming languages today, and is used for everything from basic scripting to machine learning.',
      "In the Scientific Computing for Python Certification, you'll learn the fundamentals of Python including variables, loops, conditionals, and functions. Then you'll quickly ramp up to complex data structures, networking, relational databases, and data vizualization."
    ],
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/pair_programming_njlp.svg',
    blocks: {
      'python-for-everybody': {
        title: 'Python for Everybody',
        intro: ['Intro text 1', 'Intro text 2']
      }
    }
  },
  'data-analysis-with-python': {
    title: 'Data Analysis with Python',
    intro: [
      'Data Analysis has been around for a long time, but up until a few years ago, it was practiced using closed, expensive, and limited tools like Excel or Tableau. Python, SQL, and other open libraries have changed Data Analysis forever.',
      "In the Data Analysis with Python Certification, you'll learn the fundamentals of data analysis with Python. By the end of this certification, you'll know how to read from sources like CSVs and SQL, and use libraries like Numpy, Pandas, Matplotlib, and Seaborn to process and visualize data."
    ],
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/design_data_khdb.svg',
    blocks: {
      'data-analysis-with-python-course': {
        title: 'Data Analysis with Python',
        intro: ['Intro text 1', 'Intro text 2']
      },
      numpy: {
        title: 'Numpy',
        intro: ['Intro text 1', 'Intro text 2']
      }
    }
  },
  'information-security': {
    title: 'Information Security',
    intro: [
      "With everything we do online, there's a vast amount of sensitive information at risk — email addresses, passwords, phone numbers, and much, much more.",
      "With the Information Security Certification, you'll build a secure web app with HelmetJS to learn the fundamentals of protecting people's information online.",
      "You'll also build a TCP client, and an Nmap and port scanner in Python to learn the basics of penetration testing — an important component of good information security, or infosec."
    ],
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/security_o890.svg',
    blocks: {
      'information-security-with-helmetjs': {
        title: 'Information Security with HelmetJS',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'python-for-penetration-testing': {
        title: 'Python for Penetration Testing',
        intro: ['Intro text 1', 'Intro text 2']
      }
    }
  },
  'machine-learning-with-python': {
    title: 'Machine Learning with Python',
    intro: [
      'Machine learning has many practical applications you can use in your projects or on the job.',
      "In the Machine Learning with Python Certification, you'll use the TensorFlow framework to build different neural networks, and explore more advanced techniques like natural language processing and reinforcement learning.",
      "You'll also dive into neural networks, and learn the principles behind how deep, recurrent, and convolutional neural networks work."
    ],
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Artificial_intelligence_re_enpp.svg',
    blocks: {
      tensorflow: {
        title: 'Tensorflow',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'how-neural-networks-work': {
        title: 'How Neural Networks Work',
        intro: ['Intro text 1', 'Intro text 2']
      }
    }
  },
  'coding-interview-prep': {
    title: 'Coding Interview Prep',
    intro: [
      "If you're looking for free coding exercises to prepare for your next job interview, we've got you covered.",
      'This section contains hundreds of coding challenges that test your knowledge of algorithms, data structures, and mathematics. It also has a number of take home projects you can use to strengthen your skills, or add to your portfolio.'
    ],
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/software_engineer_lvl5.svg',
    blocks: {
      algorithms: {
        title: 'Algorithms',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'data-structures': {
        title: 'Data Structures',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'take-home-projects': {
        title: 'Take Home Projects',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'rosetta-code': {
        title: 'Rosetta Code',
        intro: ['Intro text 1', 'Intro text 2']
      },
      'project-euler': {
        title: 'Project Euler',
        intro: ['Intro text 1', 'Intro text 2']
      }
    }
  }
};

exports.introSchema = introSchema;
