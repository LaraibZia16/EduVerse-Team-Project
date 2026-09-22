/*======================================
            COURSE PAGE
======================================*/

/*======================================
            ELEMENTS
======================================*/

const courseSearch = document.getElementById("courseSearch");

const categoryFilter = document.getElementById("categoryFilter");

const levelFilter = document.getElementById("levelFilter");

const clearFilters = document.getElementById("clearFilters");

const courseCards = document.querySelectorAll(".course-card-item");

const courseCount = document.getElementById("courseCount");

const detailsButtons = document.querySelectorAll(".details-btn");


/*======================================
            MODAL ELEMENTS
======================================*/

const modal = document.getElementById("courseModal");

const closeModal = document.getElementById("closeCourseModal");

const modalCloseBtn = document.querySelector(".modal-close-btn");

const modalTitle = document.getElementById("modalTitle");

const modalDescription = document.getElementById("modalDescription");

const modalCourseImage = document.getElementById("modalCourseImage");

const modalTeacherImage = document.getElementById("modalTeacherImage");

const modalTeacher = document.getElementById("modalTeacher");

const modalTeacherRole = document.getElementById("modalTeacherRole");

const modalEducation = document.getElementById("modalEducation");

const modalExperience = document.getElementById("modalExperience");

const modalTeacherRating = document.getElementById("modalTeacherRating");

const modalTeacherCourses = document.getElementById("modalTeacherCourses");

const modalCategory = document.getElementById("modalCategory");

const modalLevel = document.getElementById("modalLevel");

const modalDuration = document.getElementById("modalDuration");

const modalLessons = document.getElementById("modalLessons");

const modalRating = document.getElementById("modalRating");

const modalStudents = document.getElementById("modalStudents");

const modalLanguage = document.getElementById("modalLanguage");

const modalCertificate = document.getElementById("modalCertificate");

const modalOverview = document.getElementById("modalOverview");

const modalLearning = document.getElementById("modalLearning");

const modalCourseContent = document.getElementById("modalCourseContent");

const modalContentSummary = document.getElementById("modalContentSummary");

const modalRequirements = document.getElementById("modalRequirements");


/*======================================
            COURSE HELPER
======================================*/

function createCourse(

    teacher,

    teacherRole,

    education,

    experience,

    teacherRating,

    teacherCourses,

    category,

    rating,

    students,

    duration,

    lessons,

    level,

    language,

    certificate,

    description,

    overview,

    image,

    teacherImage,

    learning,

    requirements,

    modules

){

    return{

        teacher,

        teacherRole,

        education,

        experience,

        teacherRating,

        teacherCourses,

        category,

        rating,

        students,

        duration,

        lessons,

        level,

        language,

        certificate,

        description,

        overview,

        image,

        teacherImage,

        learning,

        requirements,

        modules

    };

}


/*======================================
            COURSE DATA
======================================*/

const coursesData={


    /*==================================
            ARTIFICIAL INTELLIGENCE
    ==================================*/

    "AI Fundamentals":createCourse(

        "Sarah Khan",

        "Senior AI Instructor",

        "MSc Artificial Intelligence",

        "10+ Years Experience",

        "4.9",

        "12 Courses",

        "Artificial Intelligence",

        "4.9",

        "12,540 Students",

        "8 Weeks",

        "32 Lessons",

        "Beginner",

        "English",

        "Included",

        "Learn Artificial Intelligence from beginner level using practical projects and real-world applications.",

        "This course introduces you to the foundations of Artificial Intelligence in a simple and practical way. You will explore AI concepts, modern AI tools, machine learning fundamentals and real-world applications while working on practical projects.",

        "assets/images/courses/ai-fundamentals.png",

        "assets/images/courses/teachers/teacher1.jpg",

        [

            "Artificial Intelligence Basics",

            "Prompt Engineering",

            "Machine Learning Concepts",

            "Real-World AI Applications",

            "Practical AI Projects"

        ],

        [

            "Basic Computer Skills",

            "No Programming Experience Required"

        ],

        [

            {

                title:"Introduction to Artificial Intelligence",

                lessons:"6 Lessons",

                duration:"45 min",

                topics:[

                    "What is Artificial Intelligence?",

                    "History and evolution of AI",

                    "Types of AI",

                    "Real-world AI applications"

                ]

            },

            {

                title:"AI Tools & Prompt Engineering",

                lessons:"7 Lessons",

                duration:"55 min",

                topics:[

                    "Introduction to AI tools",

                    "Writing effective prompts",

                    "Prompt techniques",

                    "Practical AI tasks"

                ]

            },

            {

                title:"Machine Learning Fundamentals",

                lessons:"9 Lessons",

                duration:"1 hr 20 min",

                topics:[

                    "Machine learning basics",

                    "Training data",

                    "Supervised and unsupervised learning",

                    "Model evaluation"

                ]

            },

            {

                title:"Practical AI Projects",

                lessons:"10 Lessons",

                duration:"2 hr",

                topics:[

                    "AI project planning",

                    "Building practical projects",

                    "Testing and improvement",

                    "Final AI project"

                ]

            }

        ]

    ),


    "Machine Learning":createCourse(

        "Ali Raza",

        "Machine Learning Instructor",

        "MS Data Science",

        "8+ Years Experience",

        "4.8",

        "9 Courses",

        "Artificial Intelligence",

        "4.8",

        "10,230 Students",

        "10 Weeks",

        "40 Lessons",

        "Intermediate",

        "English",

        "Included",

        "Build machine learning models using Python and real datasets.",

        "Learn how to analyze data and build practical machine learning models using Python. This course covers the complete machine learning workflow from preparing data to evaluating models.",

        "assets/images/courses/machine-learning.png", 

         "assets/images/courses/teachers/teacher2.jpg",

        [

            "Regression",

            "Classification",

            "Scikit Learn",

            "Data Preparation",

            "Machine Learning Projects"

        ],

        [

            "Python Basics",

            "Basic Mathematics"

        ],

        [

            {

                title:"Machine Learning Foundations",

                lessons:"8 Lessons",

                duration:"1 hr",

                topics:[

                    "Machine learning concepts",

                    "Types of learning",

                    "Machine learning workflow"

                ]

            },

            {

                title:"Data Preparation",

                lessons:"10 Lessons",

                duration:"1 hr 15 min",

                topics:[

                    "Data cleaning",

                    "Feature selection",

                    "Data splitting",

                    "Preprocessing"

                ]

            },

            {

                title:"Machine Learning Models",

                lessons:"12 Lessons",

                duration:"1 hr 40 min",

                topics:[

                    "Regression",

                    "Classification",

                    "Decision trees",

                    "Model evaluation"

                ]

            },

            {

                title:"Practical Projects",

                lessons:"10 Lessons",

                duration:"2 hr",

                topics:[

                    "Real datasets",

                    "Model training",

                    "Testing models",

                    "Final project"

                ]

            }

        ]

    ),


    "Deep Learning":createCourse(

        "Ahmed Hassan",

        "Deep Learning Specialist",

        "PhD Computer Science",

        "12+ Years Experience",

        "5.0",

        "8 Courses",

        "Artificial Intelligence",

        "5.0",

        "9,410 Students",

        "12 Weeks",

        "48 Lessons",

        "Advanced",

        "English",

        "Included",

        "Master Neural Networks, TensorFlow and Computer Vision.",

        "This advanced course takes you into deep learning and neural networks. You will learn how modern AI systems process complex data and build deep learning projects using industry-standard tools.",

        "assets/images/courses/deep-learning.png",

        "assets/images/courses/teachers/teacher3.jpg",
        [

            "Neural Networks",

            "TensorFlow",

            "Deep Learning Models",

            "Computer Vision",

            "Real AI Projects"

        ],

        [

            "Python",

            "Machine Learning Fundamentals"

        ],

        [

            {

                title:"Neural Network Foundations",

                lessons:"10 Lessons",

                duration:"1 hr 30 min",

                topics:[

                    "Neurons and layers",

                    "Activation functions",

                    "Forward propagation",

                    "Backpropagation"

                ]

            },

            {

                title:"TensorFlow & Model Building",

                lessons:"12 Lessons",

                duration:"1 hr 45 min",

                topics:[

                    "TensorFlow basics",

                    "Building neural networks",

                    "Training models",

                    "Model optimization"

                ]

            },

            {

                title:"Computer Vision",

                lessons:"12 Lessons",

                duration:"2 hr",

                topics:[

                    "Image processing",

                    "CNN",

                    "Image classification",

                    "Object detection basics"

                ]

            },

            {

                title:"Deep Learning Project",

                lessons:"14 Lessons",

                duration:"2 hr 30 min",

                topics:[

                    "Project planning",

                    "Dataset preparation",

                    "Model training",

                    "Final project"

                ]

            }

        ]

    ),


    /*==================================
            WEB DEVELOPMENT
    ==================================*/

    "HTML & CSS Mastery":createCourse(

        "Fatima Noor",

        "Senior Web Development Instructor",

        "MS Software Engineering",

        "7+ Years Experience",

        "4.9",

        "14 Courses",

        "Web Development",

        "4.9",

        "14,620 Students",

        "6 Weeks",

        "28 Lessons",

        "Beginner",

        "English",

        "Included",

        "Build beautiful responsive websites using HTML5 and CSS3.",

        "Start your web development journey by learning how websites are structured and styled. You will create responsive layouts and complete practical website projects.",

        "assets/images/courses/html-css.png",

        "assets/images/courses/teachers/teacher4.png",

        [

            "HTML5",

            "CSS3",

            "Flexbox",

            "Responsive Design",

            "Website Projects"

        ],

        [

            "Basic Computer Knowledge"

        ],

        [

            {

                title:"HTML5 Fundamentals",

                lessons:"7 Lessons",

                duration:"50 min",

                topics:[

                    "HTML structure",

                    "Semantic elements",

                    "Forms",

                    "Links and media"

                ]

            },

            {

                title:"CSS3 Fundamentals",

                lessons:"7 Lessons",

                duration:"1 hr",

                topics:[

                    "Selectors",

                    "Colors and typography",

                    "Box model",

                    "CSS positioning"

                ]

            },

            {

                title:"Responsive Web Design",

                lessons:"7 Lessons",

                duration:"1 hr",

                topics:[

                    "Flexbox",

                    "Media queries",

                    "Responsive layouts",

                    "Mobile-first design"

                ]

            },

            {

                title:"Website Project",

                lessons:"7 Lessons",

                duration:"1 hr 30 min",

                topics:[

                    "Project planning",

                    "Page structure",

                    "Responsive styling",

                    "Final website"

                ]

            }

        ]

    ),


    "JavaScript Essentials":createCourse(

        "Hamza Ali",

        "JavaScript & Frontend Instructor",

        "MS Computer Science",

        "9+ Years Experience",

        "4.8",

        "11 Courses",

        "Web Development",

        "4.8",

        "13,220 Students",

        "8 Weeks",

        "36 Lessons",

        "Intermediate",

        "English",

        "Included",

        "Learn modern JavaScript with DOM and ES6.",

        "Build a strong foundation in modern JavaScript and learn how to create interactive web experiences using real-world examples and projects.",

        "assets/images/courses/javascript.png",

       "assets/images/courses/teachers/teacher5.png",

        [

            "JavaScript Basics",

            "DOM Manipulation",

            "ES6",

            "Functions",

            "Interactive Projects"

        ],

        [

            "HTML",

            "CSS"

        ],

        [

            {

                title:"JavaScript Fundamentals",

                lessons:"9 Lessons",

                duration:"1 hr",

                topics:[

                    "Variables",

                    "Data types",

                    "Operators",

                    "Conditions and loops"

                ]

            },

            {

                title:"Functions & Modern JavaScript",

                lessons:"9 Lessons",

                duration:"1 hr 20 min",

                topics:[

                    "Functions",

                    "Arrow functions",

                    "Arrays",

                    "Objects"

                ]

            },

            {

                title:"DOM & Events",

                lessons:"9 Lessons",

                duration:"1 hr 30 min",

                topics:[

                    "DOM selection",

                    "Event handling",

                    "Forms",

                    "Dynamic content"

                ]

            },

            {

                title:"JavaScript Projects",

                lessons:"9 Lessons",

                duration:"2 hr",

                topics:[

                    "Project planning",

                    "Interactive UI",

                    "Validation",

                    "Final project"

                ]

            }

        ]

    ),


    "Bootstrap 5":createCourse(

        "Ayesha Khan",

        "Frontend Development Instructor",

        "BS Software Engineering",

        "6+ Years Experience",

        "4.7",

        "8 Courses",

        "Web Development",

        "4.7",

        "8,430 Students",

        "5 Weeks",

        "24 Lessons",

        "Beginner",

        "English",

        "Included",

        "Create responsive websites quickly using Bootstrap 5.",

        "Learn how to use Bootstrap components and utilities to create responsive and attractive websites faster.",

        "assets/images/courses/bootstrap.png",

        "assets/images/courses/teachers/teacher6.png",

        [

            "Bootstrap Grid",

            "Cards",

            "Navbar",

            "Forms",

            "Responsive Layouts"

        ],

        [

            "HTML",

            "CSS"

        ],

        [

            {

                title:"Bootstrap Fundamentals",

                lessons:"6 Lessons",

                duration:"40 min",

                topics:[

                    "Bootstrap setup",

                    "Containers",

                    "Grid system"

                ]

            },

            {

                title:"Bootstrap Components",

                lessons:"6 Lessons",

                duration:"55 min",

                topics:[

                    "Cards",

                    "Buttons",

                    "Navbar",

                    "Forms"

                ]

            },

            {

                title:"Responsive Design",

                lessons:"6 Lessons",

                duration:"50 min",

                topics:[

                    "Responsive utilities",

                    "Breakpoints",

                    "Responsive layouts"

                ]

            },

            {

                title:"Bootstrap Project",

                lessons:"6 Lessons",

                duration:"1 hr 20 min",

                topics:[

                    "Page planning",

                    "Components",

                    "Responsive styling",

                    "Final project"

                ]

            }

        ]

    ),


    /*==================================
            PROGRAMMING
    ==================================*/

    "Python Programming":createCourse(

        "Bilal Ahmed",

        "Senior Python Instructor",

        "MS Computer Science",

        "10+ Years Experience",

        "4.9",

        "15 Courses",

        "Programming",

        "4.9",

        "15,000 Students",

        "9 Weeks",

        "42 Lessons",

        "Beginner",

        "English",

        "Included",

        "Master Python programming from beginner to advanced level.",

        "Learn Python step by step and develop a strong programming foundation through practical exercises and real-world projects.",

        "assets/images/courses/python.png",

        "assets/images/courses/teachers/teacher7.png",

        [

            "Python Basics",

            "Variables and Data Types",

            "Functions",

            "Object-Oriented Programming",

            "Projects"

        ],

        [

            "No Programming Experience Required"

        ],

        [

            {

                title:"Python Fundamentals",

                lessons:"10 Lessons",

                duration:"1 hr",

                topics:[

                    "Python setup",

                    "Variables",

                    "Data types",

                    "Operators"

                ]

            },

            {

                title:"Control Flow & Functions",

                lessons:"10 Lessons",

                duration:"1 hr 20 min",

                topics:[

                    "Conditions",

                    "Loops",

                    "Functions",

                    "Error handling"

                ]

            },

            {

                title:"Object-Oriented Programming",

                lessons:"10 Lessons",

                duration:"1 hr 40 min",

                topics:[

                    "Classes",

                    "Objects",

                    "Inheritance",

                    "Encapsulation"

                ]

            },

            {

                title:"Python Projects",

                lessons:"12 Lessons",

                duration:"2 hr",

                topics:[

                    "Project planning",

                    "File handling",

                    "Practical applications",

                    "Final project"

                ]

            }

        ]

    ),


    "Java Programming":createCourse(

        "Hassan Raza",

        "Java Programming Instructor",

        "MS Software Engineering",

        "11+ Years Experience",

        "4.8",

        "10 Courses",

        "Programming",

        "4.8",

        "11,320 Students",

        "10 Weeks",

        "44 Lessons",

        "Intermediate",

        "English",

        "Included",

        "Build Java desktop applications using OOP concepts.",

        "Develop strong Java programming skills with object-oriented programming, collections and practical application development.",

        "assets/images/courses/java.png",

        "assets/images/courses/teachers/teacher8.png",

        [

            "Java Fundamentals",

            "OOP",

            "Collections",

            "Exception Handling",

            "Projects"

        ],

        [

            "Programming Basics"

        ],

        [

            {

                title:"Java Fundamentals",

                lessons:"10 Lessons",

                duration:"1 hr",

                topics:[

                    "Java syntax",

                    "Variables",

                    "Conditions",

                    "Loops"

                ]

            },

            {

                title:"Object-Oriented Programming",

                lessons:"12 Lessons",

                duration:"1 hr 30 min",

                topics:[

                    "Classes",

                    "Objects",

                    "Inheritance",

                    "Polymorphism"

                ]

            },

            {

                title:"Collections & Exceptions",

                lessons:"10 Lessons",

                duration:"1 hr 20 min",

                topics:[

                    "Lists",

                    "Sets",

                    "Maps",

                    "Exception handling"

                ]

            },

            {

                title:"Java Project",

                lessons:"12 Lessons",

                duration:"2 hr",

                topics:[

                    "Application planning",

                    "OOP implementation",

                    "Testing",

                    "Final project"

                ]

            }

        ]

    ),


    "C++ Programming":createCourse(

        "Umar Farooq",

        "C++ & Software Development Instructor",

        "MS Computer Science",

        "10+ Years Experience",

        "4.9",

        "9 Courses",

        "Programming",

        "4.9",

        "9,800 Students",

        "10 Weeks",

        "46 Lessons",

        "Advanced",

        "English",

        "Included",

        "Master Object Oriented Programming using C++.",

        "Learn advanced C++ concepts and develop strong object-oriented programming skills through practical examples and projects.",

        "assets/images/courses/cpp.png",

        "assets/images/courses/teachers/teacher9.png",

        [

            "C++ Fundamentals",

            "Pointers",

            "OOP",

            "STL",

            "Projects"

        ],

        [

            "C++ Basics"

        ],

        [

            {

                title:"C++ Fundamentals",

                lessons:"10 Lessons",

                duration:"1 hr",

                topics:[

                    "C++ syntax",

                    "Variables",

                    "Functions",

                    "Memory basics"

                ]

            },

            {

                title:"Object-Oriented Programming",

                lessons:"12 Lessons",

                duration:"1 hr 30 min",

                topics:[

                    "Classes",

                    "Objects",

                    "Inheritance",

                    "Polymorphism"

                ]

            },

            {

                title:"Pointers & STL",

                lessons:"12 Lessons",

                duration:"1 hr 40 min",

                topics:[

                    "Pointers",

                    "References",

                    "STL",

                    "Containers"

                ]

            },

            {

                title:"C++ Projects",

                lessons:"12 Lessons",

                duration:"2 hr",

                topics:[

                    "Project planning",

                    "Implementation",

                    "Testing",

                    "Final project"

                ]

            }

        ]

    ),


    /*==================================
            MICROSOFT OFFICE
    ==================================*/

    "Microsoft Word":createCourse(

        "Hina Malik",

        "Microsoft Office Instructor",

        "MS Information Technology",

        "8+ Years Experience",

        "4.8",

        "7 Courses",

        "Microsoft Office",

        "4.8",

        "7,850 Students",

        "4 Weeks",

        "20 Lessons",

        "Beginner",

        "English",

        "Included",

        "Learn professional document creation using Microsoft Word.",

        "Learn how to create, format and manage professional documents using Microsoft Word and its most useful features.",

        "assets/images/courses/ms-word.png",

        "assets/images/courses/teachers/teacher10.png",

        [

            "Document Formatting",

            "Tables",

            "Headers & Footers",

            "Professional Documents"

        ],

        [

            "Basic Computer Skills"

        ],

        [

            {

                title:"Word Fundamentals",

                lessons:"5 Lessons",

                duration:"35 min",

                topics:[

                    "Word interface",

                    "Creating documents",

                    "Saving and printing"

                ]

            },

            {

                title:"Formatting Documents",

                lessons:"5 Lessons",

                duration:"45 min",

                topics:[

                    "Fonts",

                    "Paragraphs",

                    "Styles",

                    "Page layout"

                ]

            },

            {

                title:"Tables & Advanced Tools",

                lessons:"5 Lessons",

                duration:"45 min",

                topics:[

                    "Tables",

                    "Headers",

                    "Footers",

                    "Page numbers"

                ]

            },

            {

                title:"Professional Document Project",

                lessons:"5 Lessons",

                duration:"1 hr",

                topics:[

                    "Document planning",

                    "Professional formatting",

                    "Final document"

                ]

            }

        ]

    ),


    "Microsoft Excel":createCourse(

        "Asad Khan",

        "Data & Excel Instructor",

        "MS Data Analytics",

        "11+ Years Experience",

        "4.9",

        "12 Courses",

        "Microsoft Office",

        "4.9",

        "13,420 Students",

        "6 Weeks",

        "30 Lessons",

        "Intermediate",

        "English",

        "Included",

        "Master Excel formulas, charts, dashboards and data analysis.",

        "Develop practical Excel skills for data analysis, reporting and dashboard creation using real-world examples.",

        "assets/images/courses/ms-excel.png",

        "assets/images/courses/teachers/teacher11.png",

        [

            "Formulas",

            "Functions",

            "Charts",

            "Dashboards",

            "Data Analysis"

        ],

        [

            "Basic Excel Knowledge"

        ],

        [

            {

                title:"Excel Fundamentals",

                lessons:"7 Lessons",

                duration:"50 min",

                topics:[

                    "Workbook basics",

                    "Cells and ranges",

                    "Formatting"

                ]

            },

            {

                title:"Formulas & Functions",

                lessons:"8 Lessons",

                duration:"1 hr",

                topics:[

                    "Basic formulas",

                    "Functions",

                    "Logical functions",

                    "Lookup functions"

                ]

            },

            {

                title:"Charts & Data Analysis",

                lessons:"7 Lessons",

                duration:"1 hr 15 min",

                topics:[

                    "Charts",

                    "Sorting",

                    "Filtering",

                    "Data analysis"

                ]

            },

            {

                title:"Dashboard Project",

                lessons:"8 Lessons",

                duration:"1 hr 40 min",

                topics:[

                    "Dashboard planning",

                    "Visualizations",

                    "Interactive dashboard",

                    "Final project"

                ]

            }

        ]

    ),


    "Microsoft PowerPoint":createCourse(

        "Sana Iqbal",

        "Presentation Design Instructor",

        "MS Business Administration",

        "7+ Years Experience",

        "4.8",

        "6 Courses",

        "Microsoft Office",

        "4.8",

        "8,940 Students",

        "5 Weeks",

        "24 Lessons",

        "Beginner",

        "English",

        "Included",

        "Create attractive presentations with animations and transitions.",

        "Learn how to design clear, engaging and professional presentations using PowerPoint's most important tools.",

        "assets/images/courses/ms-powerpoint.png",

        "assets/images/courses/teachers/teacher12.png",

        [

            "Slide Design",

            "Animations",

            "Transitions",

            "Presentation Design",

            "Professional Presentations"

        ],

        [

            "Basic Computer Skills"

        ],

        [

            {

                title:"PowerPoint Fundamentals",

                lessons:"6 Lessons",

                duration:"40 min",

                topics:[

                    "PowerPoint interface",

                    "Creating slides",

                    "Layouts"

                ]

            },

            {

                title:"Professional Slide Design",

                lessons:"6 Lessons",

                duration:"50 min",

                topics:[

                    "Typography",

                    "Colors",

                    "Images",

                    "Visual hierarchy"

                ]

            },

            {

                title:"Animations & Transitions",

                lessons:"6 Lessons",

                duration:"45 min",

                topics:[

                    "Animations",

                    "Transitions",

                    "Timing",

                    "Presentation flow"

                ]

            },

            {

                title:"Presentation Project",

                lessons:"6 Lessons",

                duration:"1 hr",

                topics:[

                    "Planning",

                    "Slide creation",

                    "Final presentation"

                ]

            }

        ]

    ),


    /*==================================
            GRAPHIC DESIGN
    ==================================*/

    "Adobe Photoshop":createCourse(

        "Noor Fatima",

        "Graphic Design Instructor",

        "BS Graphic Design",

        "9+ Years Experience",

        "4.8",

        "10 Courses",

        "Graphic Design",

        "4.8",

        "9,120 Students",

        "7 Weeks",

        "34 Lessons",

        "Beginner",

        "English",

        "Included",

        "Learn professional photo editing and graphic design.",

        "Learn Photoshop from the basics and create professional graphics, edited images and social media designs.",

        "assets/images/courses/photoshop.png",

        "assets/images/courses/teachers/teacher13.png",

        [

            "Photo Editing",

            "Layers",

            "Retouching",

            "Social Media Design",

            "Graphic Design Projects"

        ],

        [

            "Basic Computer Skills"

        ],

        [

            {

                title:"Photoshop Fundamentals",

                lessons:"8 Lessons",

                duration:"55 min",

                topics:[

                    "Photoshop interface",

                    "Tools",

                    "Layers",

                    "Selections"

                ]

            },

            {

                title:"Photo Editing & Retouching",

                lessons:"9 Lessons",

                duration:"1 hr 20 min",

                topics:[

                    "Color correction",

                    "Retouching",

                    "Image adjustments"

                ]

            },

            {

                title:"Graphic Design",

                lessons:"8 Lessons",

                duration:"1 hr 15 min",

                topics:[

                    "Typography",

                    "Compositions",

                    "Social media graphics"

                ]

            },

            {

                title:"Design Project",

                lessons:"9 Lessons",

                duration:"1 hr 45 min",

                topics:[

                    "Project planning",

                    "Design development",

                    "Final graphic"

                ]

            }

        ]

    ),


    "Adobe Illustrator":createCourse(

        "Maryam Ali",

        "Vector Design Instructor",

        "BS Visual Communication Design",

        "10+ Years Experience",

        "4.9",

        "8 Courses",

        "Graphic Design",

        "4.9",

        "8,450 Students",

        "8 Weeks",

        "36 Lessons",

        "Intermediate",

        "English",

        "Included",

        "Create logos, icons and vector illustrations.",

        "Master Illustrator's vector design tools and create professional logos, icons and brand assets.",

        "assets/images/courses/illustrator.png",

       "assets/images/courses/teachers/teacher14.png",

        [

            "Vector Graphics",

            "Logo Design",

            "Illustrations",

            "Brand Identity",

            "Creative Projects"

        ],

        [

            "Basic Photoshop Knowledge"

        ],

        [

            {

                title:"Illustrator Fundamentals",

                lessons:"9 Lessons",

                duration:"1 hr",

                topics:[

                    "Illustrator interface",

                    "Pen tool",

                    "Shapes",

                    "Paths"

                ]

            },

            {

                title:"Logo & Icon Design",

                lessons:"9 Lessons",

                duration:"1 hr 20 min",

                topics:[

                    "Logo concepts",

                    "Typography",

                    "Icon design",

                    "Brand marks"

                ]

            },

            {

                title:"Vector Illustrations",

                lessons:"9 Lessons",

                duration:"1 hr 30 min",

                topics:[

                    "Illustration techniques",

                    "Colors",

                    "Gradients",

                    "Composition"

                ]

            },

            {

                title:"Brand Identity Project",

                lessons:"9 Lessons",

                duration:"2 hr",

                topics:[

                    "Brand planning",

                    "Logo system",

                    "Brand assets",

                    "Final project"

                ]

            }

        ]

    ),


    "UI UX Design":createCourse(

        "Zain Abbas",

        "UI/UX Design Specialist",

        "MSc Human Computer Interaction",

        "12+ Years Experience",

        "5.0",

        "13 Courses",

        "Graphic Design",

        "5.0",

        "10,730 Students",

        "9 Weeks",

        "40 Lessons",

        "Advanced",

        "English",

        "Included",

        "Design beautiful and user-friendly web and mobile interfaces.",

        "Learn the complete UI/UX design process from understanding users to creating wireframes, prototypes and polished digital interfaces.",

        "assets/images/courses/uiux.png",

        "assets/images/courses/teachers/teacher15.png",

        [

            "User Research",

            "Wireframing",

            "Figma",

            "Prototyping",

            "UI Design"

        ],

        [

            "Basic Design Knowledge"

        ],

        [

            {

                title:"UX Fundamentals",

                lessons:"10 Lessons",

                duration:"1 hr 10 min",

                topics:[

                    "UX principles",

                    "User needs",

                    "User journeys",

                    "Research basics"

                ]

            },

            {

                title:"Wireframing & Information Architecture",

                lessons:"10 Lessons",

                duration:"1 hr 30 min",

                topics:[

                    "Wireframes",

                    "Page structure",

                    "Navigation",

                    "User flows"

                ]

            },

            {

                title:"Figma & UI Design",

                lessons:"10 Lessons",

                duration:"1 hr 40 min",

                topics:[

                    "Figma basics",

                    "Design systems",

                    "Components",

                    "Responsive UI"

                ]

            },

            {

                title:"Prototype & Final Project",

                lessons:"10 Lessons",

                duration:"2 hr",

                topics:[

                    "Interactive prototypes",

                    "Usability testing",

                    "Design improvements",

                    "Final product"

                ]

            }

        ]

    ),


    /*==================================
            CYBER SECURITY
    ==================================*/

    "Cyber Security Basics":createCourse(

        "Talha Khan",

        "Cyber Security Instructor",

        "MS Cyber Security",

        "9+ Years Experience",

        "4.8",

        "7 Courses",

        "Cyber Security",

        "4.8",

        "7,960 Students",

        "6 Weeks",

        "28 Lessons",

        "Beginner",

        "English",

        "Included",

        "Protect systems and networks from common cyber threats.",

        "Understand the fundamentals of cyber security and learn practical methods for protecting personal and organizational systems.",

        "assets/images/courses/cyber.png",

        "assets/images/courses/teachers/teacher16.png",

        [

            "Cyber Security Basics",

            "Common Threats",

            "Network Security",

            "Security Best Practices"

        ],

        [

            "Basic Computer Knowledge"

        ],

        [

            {

                title:"Cyber Security Fundamentals",

                lessons:"7 Lessons",

                duration:"50 min",

                topics:[

                    "Cyber security concepts",

                    "Threat landscape",

                    "Security principles"

                ]

            },

            {

                title:"Common Cyber Threats",

                lessons:"7 Lessons",

                duration:"55 min",

                topics:[

                    "Malware",

                    "Phishing",

                    "Social engineering",

                    "Common attacks"

                ]

            },

            {

                title:"Network Security",

                lessons:"7 Lessons",

                duration:"1 hr",

                topics:[

                    "Network protection",

                    "Firewalls",

                    "Secure communication"

                ]

            },

            {

                title:"Security Best Practices",

                lessons:"7 Lessons",

                duration:"1 hr",

                topics:[

                    "Account security",

                    "Data protection",

                    "Security policies",

                    "Practical checklist"

                ]

            }

        ]

    ),


    "Ethical Hacking":createCourse(

        "Ibrahim Malik",

        "Ethical Hacking Instructor",

        "MS Cyber Security",

        "11+ Years Experience",

        "4.9",

        "9 Courses",

        "Cyber Security",

        "4.9",

        "9,650 Students",

        "8 Weeks",

        "36 Lessons",

        "Intermediate",

        "English",

        "Included",

        "Learn penetration testing and ethical hacking tools.",

        "Learn ethical security testing concepts and understand how security professionals identify and report vulnerabilities in authorized environments.",

        "assets/images/courses/hacking.png",

        "assets/images/courses/teachers/teacher17.png",

        [

            "Ethical Hacking Concepts",

            "Penetration Testing",

            "Security Tools",

            "Security Auditing"

        ],

        [

            "Networking Basics",

            "Basic Cyber Security Knowledge"

        ],

        [

            {

                title:"Ethical Hacking Fundamentals",

                lessons:"9 Lessons",

                duration:"1 hr",

                topics:[

                    "Ethical hacking concepts",

                    "Security testing",

                    "Legal and ethical boundaries"

                ]

            },

            {

                title:"Security Assessment",

                lessons:"9 Lessons",

                duration:"1 hr 15 min",

                topics:[

                    "Reconnaissance",

                    "Vulnerability assessment",

                    "Risk identification"

                ]

            },

            {

                title:"Security Testing Tools",

                lessons:"9 Lessons",

                duration:"1 hr 30 min",

                topics:[

                    "Security testing tools",

                    "Lab environment",

                    "Testing methodology"

                ]

            },

            {

                title:"Security Audit Project",

                lessons:"9 Lessons",

                duration:"1 hr 45 min",

                topics:[

                    "Audit planning",

                    "Finding vulnerabilities",

                    "Reporting",

                    "Final assessment"

                ]

            }

        ]

    ),


    "Network Security":createCourse(

        "Abdullah Shah",

        "Network Security Specialist",

        "MS Network Security",

        "13+ Years Experience",

        "5.0",

        "10 Courses",

        "Cyber Security",

        "5.0",

        "8,320 Students",

        "10 Weeks",

        "44 Lessons",

        "Advanced",

        "English",

        "Included",

        "Secure enterprise networks using modern security techniques.",

        "Develop advanced knowledge of network security and learn how organizations protect their infrastructure from modern threats.",

        "assets/images/courses/network-security.png",

        "assets/images/courses/teachers/teacher18.png",

        [

            "Firewalls",

            "VPN",

            "Network Monitoring",

            "IDS",

            "Enterprise Security"

        ],

        [

            "Cyber Security Basics",

            "Networking Fundamentals"

        ],

        [

            {

                title:"Network Security Fundamentals",

                lessons:"11 Lessons",

                duration:"1 hr 15 min",

                topics:[

                    "Network security principles",

                    "Threats",

                    "Security architecture"

                ]

            },

            {

                title:"Firewalls & VPN",

                lessons:"11 Lessons",

                duration:"1 hr 30 min",

                topics:[

                    "Firewall concepts",

                    "Firewall policies",

                    "VPN",

                    "Secure remote access"

                ]

            },

            {

                title:"Intrusion Detection",

                lessons:"11 Lessons",

                duration:"1 hr 40 min",

                topics:[

                    "IDS concepts",

                    "Monitoring",

                    "Security alerts",

                    "Incident response"

                ]

            },

            {

                title:"Enterprise Security Project",

                lessons:"11 Lessons",

                duration:"2 hr",

                topics:[

                    "Security planning",

                    "Network architecture",

                    "Security controls",

                    "Final project"

                ]

            }

        ]

    ),

    "Complete Web Development Bootcamp": createCourse(

    "Hamza Ali",
    "Senior Full Stack Web Developer",
    "MS Software Engineering",
    "9+ Years Experience",
    "4.9",
    "14 Courses",
    "Web Development",
    "4.9",
    "18,450 Students",
    "12 Weeks",
    "45 Lessons",
    "Intermediate",
    "English",
    "Included",

    "Master modern web development by building responsive and interactive websites from scratch.",

    "This complete bootcamp takes you through the full frontend development journey. You will learn HTML5, CSS3, Bootstrap, JavaScript, responsive design and practical website development while building real-world projects.",

    "assets/images/courses/web-development.png",
    "assets/images/courses/teachers/teacher5.png",

    [
        "HTML5 & Semantic Web Development",
        "CSS3 & Responsive Design",
        "Bootstrap 5",
        "JavaScript & DOM",
        "Real-World Website Projects"
    ],

    [
        "Basic Computer Knowledge",
        "No Previous Programming Experience Required"
    ],

    [
        {
            title: "HTML5 Fundamentals",
            lessons: "9 Lessons",
            duration: "1 hr 15 min",
            topics: [
                "HTML structure",
                "Semantic elements",
                "Forms and validation",
                "Links, images and media"
            ]
        },
        {
            title: "CSS3 & Responsive Design",
            lessons: "10 Lessons",
            duration: "1 hr 30 min",
            topics: [
                "CSS selectors",
                "Box model",
                "Flexbox",
                "Media queries"
            ]
        },
        {
            title: "Bootstrap 5",
            lessons: "10 Lessons",
            duration: "1 hr 20 min",
            topics: [
                "Bootstrap grid",
                "Components",
                "Cards and forms",
                "Responsive layouts"
            ]
        },
        {
            title: "JavaScript Fundamentals",
            lessons: "10 Lessons",
            duration: "1 hr 45 min",
            topics: [
                "Variables and data types",
                "Functions",
                "Arrays and objects",
                "DOM manipulation"
            ]
        },
        {
            title: "Final Website Project",
            lessons: "6 Lessons",
            duration: "2 hr",
            topics: [
                "Project planning",
                "Responsive implementation",
                "JavaScript functionality",
                "Final website"
            ]
        }
    ]

),

"UI / UX Design Masterclass": createCourse(

    "Zain Abbas",
    "Senior UI / UX Design Instructor",
    "MSc Human Computer Interaction",
    "12+ Years Experience",
    "5.0",
    "13 Courses",
    "Graphic Design",
    "5.0",
    "11,800 Students",
    "10 Weeks",
    "38 Lessons",
    "Intermediate",
    "English",
    "Included",

    "Learn to design beautiful, intuitive and user-friendly digital products.",

    "This masterclass covers the complete UI/UX design process, from understanding users and creating wireframes to designing polished interfaces and interactive prototypes using modern design tools.",

    "assets/images/courses/uiux-masterclass.png",
    "assets/images/courses/teachers/teacher15.png",

    [
        "UX Research",
        "User Flows",
        "Wireframing",
        "UI Design",
        "Figma & Prototyping"
    ],

    [
        "Basic Design Knowledge",
        "Basic Computer Skills"
    ],

    [
        {
            title: "UX Fundamentals",
            lessons: "8 Lessons",
            duration: "1 hr",
            topics: [
                "UX principles",
                "User needs",
                "User journeys",
                "UX research basics"
            ]
        },
        {
            title: "Wireframing & User Flows",
            lessons: "8 Lessons",
            duration: "1 hr 15 min",
            topics: [
                "Information architecture",
                "Wireframes",
                "User flows",
                "Navigation design"
            ]
        },
        {
            title: "UI Design with Figma",
            lessons: "10 Lessons",
            duration: "1 hr 40 min",
            topics: [
                "Figma fundamentals",
                "Design systems",
                "Components",
                "Responsive UI"
            ]
        },
        {
            title: "Prototyping & Testing",
            lessons: "6 Lessons",
            duration: "1 hr 20 min",
            topics: [
                "Interactive prototypes",
                "Micro interactions",
                "Usability testing",
                "Design improvements"
            ]
        },
        {
            title: "Final UI/UX Project",
            lessons: "6 Lessons",
            duration: "2 hr",
            topics: [
                "Project planning",
                "Complete interface",
                "Prototype",
                "Final case study"
            ]
        }
    ]

),

"Digital Marketing Fundamentals": createCourse(

    "Areeba Khan",
    "Digital Marketing Strategist",
    "MBA Marketing",
    "8+ Years Experience",
    "4.9",
    "9 Courses",
    "Digital Marketing",
    "4.9",
    "9,650 Students",
    "7 Weeks",
    "32 Lessons",
    "Beginner",
    "English",
    "Included",

    "Learn the fundamentals of SEO, social media, content marketing and digital growth.",

    "This course introduces the most important digital marketing concepts and shows you how businesses use search engines, social media, content and analytics to reach their target audience.",

    "assets/images/courses/digital-marketing.png",
    "assets/images/courses/teachers/teacher12.png",

    [
        "Digital Marketing Basics",
        "SEO Fundamentals",
        "Social Media Marketing",
        "Content Strategy",
        "Digital Analytics"
    ],

    [
        "Basic Computer Knowledge",
        "No Previous Marketing Experience Required"
    ],

    [
        {
            title: "Digital Marketing Fundamentals",
            lessons: "7 Lessons",
            duration: "50 min",
            topics: [
                "Digital marketing overview",
                "Marketing channels",
                "Target audience",
                "Marketing funnels"
            ]
        },
        {
            title: "SEO Fundamentals",
            lessons: "7 Lessons",
            duration: "1 hr",
            topics: [
                "Search engines",
                "Keywords",
                "On-page SEO",
                "SEO strategy"
            ]
        },
        {
            title: "Social Media Marketing",
            lessons: "7 Lessons",
            duration: "1 hr 10 min",
            topics: [
                "Social media platforms",
                "Content planning",
                "Audience engagement",
                "Campaign basics"
            ]
        },
        {
            title: "Content & Analytics",
            lessons: "6 Lessons",
            duration: "1 hr",
            topics: [
                "Content strategy",
                "Performance metrics",
                "Analytics",
                "Campaign improvement"
            ]
        },
        {
            title: "Digital Marketing Project",
            lessons: "5 Lessons",
            duration: "1 hr 30 min",
            topics: [
                "Campaign planning",
                "Content calendar",
                "Marketing strategy",
                "Final project"
            ]
        }
    ]

),

"Data Science & Machine Learning": createCourse(

    "Ali Raza",
    "Data Science & Machine Learning Instructor",
    "MS Data Science",
    "8+ Years Experience",
    "4.9",
    "9 Courses",
    "Data Science",
    "4.9",
    "13,400 Students",
    "12 Weeks",
    "52 Lessons",
    "Intermediate",
    "English",
    "Included",

    "Learn data analysis, visualization and machine learning using real-world datasets.",

    "This course combines data science fundamentals with practical machine learning. You will learn how to clean and analyze data, create visualizations and build machine learning models using Python.",

    "assets/images/courses/data-science.png",
    "assets/images/courses/teachers/teacher2.png",

    [
        "Python for Data Science",
        "Data Cleaning",
        "Data Visualization",
        "Statistical Analysis",
        "Machine Learning"
    ],

    [
        "Basic Python Knowledge",
        "Basic Mathematics"
    ],

    [
        {
            title: "Python for Data Science",
            lessons: "10 Lessons",
            duration: "1 hr 15 min",
            topics: [
                "Python data types",
                "NumPy",
                "Pandas",
                "Data manipulation"
            ]
        },
        {
            title: "Data Cleaning & Analysis",
            lessons: "10 Lessons",
            duration: "1 hr 30 min",
            topics: [
                "Data cleaning",
                "Missing values",
                "Data transformation",
                "Exploratory analysis"
            ]
        },
        {
            title: "Data Visualization",
            lessons: "10 Lessons",
            duration: "1 hr 20 min",
            topics: [
                "Charts",
                "Matplotlib",
                "Data storytelling",
                "Visual analysis"
            ]
        },
        {
            title: "Machine Learning",
            lessons: "12 Lessons",
            duration: "1 hr 45 min",
            topics: [
                "Machine learning basics",
                "Regression",
                "Classification",
                "Model evaluation"
            ]
        },
        {
            title: "Data Science Project",
            lessons: "10 Lessons",
            duration: "2 hr",
            topics: [
                "Real-world dataset",
                "Data preparation",
                "Model building",
                "Final analysis"
            ]
        }
    ]

),

};


/*======================================
        FILTER COURSES
======================================*/

function filterCourses(){

    const searchValue =
        courseSearch.value.toLowerCase().trim();

    const categoryValue =
        categoryFilter.value;

    const levelValue =
        levelFilter.value;

    let visibleCourses = 0;


    courseCards.forEach(card=>{

        const courseName =
            card.dataset.course.toLowerCase();

        const category =
            card.dataset.category;

        const level =
            card.dataset.level;


        const searchMatch =
            courseName.includes(searchValue);


        const categoryMatch =
            categoryValue === "all" ||
            category === categoryValue;


        const levelMatch =
            levelValue === "all" ||
            level === levelValue;


        if(

            searchMatch &&

            categoryMatch &&

            levelMatch

        ){

            card.style.display = "block";

            visibleCourses++;

        }

        else{

            card.style.display = "none";

        }

    });


    courseCount.textContent =
        visibleCourses;


    showNoCourses(visibleCourses);

}


/*======================================
        NO COURSE FOUND
======================================*/

function showNoCourses(total){

    let noCourses =
        document.getElementById("noCourses");


    if(total === 0){

        if(!noCourses){

            noCourses =
                document.createElement("div");


            noCourses.id =
                "noCourses";


            noCourses.className =
                "col-12";


            noCourses.innerHTML = `

                <div class="no-course-card">

                    <i class="fa-solid fa-book-open"></i>

                    <h3>

                        No Courses Found

                    </h3>

                    <p>

                        Try another keyword or change your filters.

                    </p>

                    <button

                        class="btn filter-btn mt-3"

                        id="resetFilters">

                        Clear Filters

                    </button>

                </div>

            `;


            document

                .getElementById("coursesContainer")

                .appendChild(noCourses);


            document

                .getElementById("resetFilters")

                .addEventListener(

                    "click",

                    ()=>{

                        resetAllFilters();

                    }

                );

        }

    }

    else{

        if(noCourses){

            noCourses.remove();

        }

    }

}


/*======================================
        RESET FILTERS
======================================*/

function resetAllFilters(){

    courseSearch.value = "";

    categoryFilter.value = "all";

    levelFilter.value = "all";

    filterCourses();

}


/*======================================
        FILTER EVENTS
======================================*/

courseSearch.addEventListener(

    "input",

    filterCourses

);


categoryFilter.addEventListener(

    "change",

    filterCourses

);


levelFilter.addEventListener(

    "change",

    filterCourses

);


clearFilters.addEventListener(

    "click",

    resetAllFilters

);


/*======================================
        RENDER LEARNING LIST
======================================*/

function renderLearning(course){

    modalLearning.innerHTML = "";


    course.learning.forEach(item=>{

        const li =
            document.createElement("li");


        li.textContent = item;


        modalLearning.appendChild(li);

    });

}


/*======================================
        RENDER REQUIREMENTS
======================================*/

function renderRequirements(course){

    modalRequirements.innerHTML = "";


    course.requirements.forEach(item=>{

        const li =
            document.createElement("li");


        li.textContent = item;


        modalRequirements.appendChild(li);

    });

}


/*======================================
        RENDER COURSE MODULES
======================================*/

function renderCourseModules(course){

    modalCourseContent.innerHTML = "";


    modalContentSummary.textContent =

        `${course.modules.length} Modules • ${course.lessons}`;


    course.modules.forEach(

        (module,index)=>{

            const moduleElement =
                document.createElement("div");


            moduleElement.className =
                "course-module";


            const topicsHTML =
                module.topics.map(

                    topic=>`

                        <li>${topic}</li>

                    `

                ).join("");


            moduleElement.innerHTML = `

                <button

                    type="button"

                    class="course-module-header">

                    <span class="course-module-header-left">

                        <span class="course-module-number">

                            ${String(index + 1).padStart(2,"0")}

                        </span>

                        <span>

                            <span class="course-module-title">

                                ${module.title}

                            </span>

                            <span class="course-module-meta">

                                ${module.lessons} • ${module.duration}

                            </span>

                        </span>

                    </span>


                    <i class="fa-solid fa-chevron-down course-module-icon"></i>

                </button>


                <div class="course-module-body">

                    <ul>

                        ${topicsHTML}

                    </ul>

                </div>

            `;


            const moduleHeader =
                moduleElement.querySelector(

                    ".course-module-header"

                );


            moduleHeader.addEventListener(

                "click",

                ()=>{

                    moduleElement.classList.toggle("active");

                }

            );


            modalCourseContent.appendChild(
                moduleElement
            );

        }

    );

}


/*======================================
        COURSE DETAILS MODAL
======================================*/

detailsButtons.forEach(button=>{

    button.addEventListener(

        "click",

        ()=>{

            const courseName =
                button.dataset.course;


            const course =
                coursesData[courseName];


            if(!course){

                console.error(

                    "Course data not found:",

                    courseName

                );

                return;

            }


            /*==============================
                BASIC COURSE INFORMATION
            ==============================*/

            modalTitle.textContent =
                courseName;


            modalDescription.textContent =
                course.description;


            modalOverview.textContent =
                course.overview;


            modalCategory.textContent =
                course.category;


            modalLevel.textContent =
                course.level;


            modalDuration.textContent =
                course.duration;


            modalLessons.textContent =
                course.lessons;


            modalRating.textContent =
                course.rating;


            modalStudents.textContent =
                course.students;


            modalLanguage.textContent =
                course.language;


            modalCertificate.textContent =
                course.certificate;


            /*==============================
                COURSE IMAGES
            ==============================*/

            modalCourseImage.src =
                course.image;


            modalCourseImage.alt =
                courseName;


            modalTeacherImage.src =
                course.teacherImage;


            modalTeacherImage.alt =
                course.teacher;


            /*==============================
                TEACHER INFORMATION
            ==============================*/

            modalTeacher.textContent =
                course.teacher;


            modalTeacherRole.textContent =
                course.teacherRole;


            modalEducation.textContent =
                course.education;


            modalExperience.textContent =
                course.experience;


            modalTeacherRating.textContent =
                course.teacherRating;


            modalTeacherCourses.textContent =
                course.teacherCourses;


            /*==============================
                LEARNING
            ==============================*/

            renderLearning(course);


            /*==============================
                REQUIREMENTS
            ==============================*/

            renderRequirements(course);


            /*==============================
                COURSE CONTENT
            ==============================*/

            renderCourseModules(course);


            /*==============================
                OPEN MODAL
            ==============================*/

            modal.classList.add("active");

            modal.setAttribute(
                "aria-hidden",
                "false"
            );


            document.body.style.overflow =
                "hidden";

        }

    );

});


/*======================================
        CLOSE MODAL
======================================*/

function closeCourseModal(){

    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/*======================================
        CLOSE BUTTON
======================================*/

closeModal.addEventListener(

    "click",

    closeCourseModal

);


modalCloseBtn.addEventListener(

    "click",

    closeCourseModal

);


/*======================================
        OUTSIDE CLICK
======================================*/

modal.addEventListener(

    "click",

    (e)=>{

        if(e.target === modal){

            closeCourseModal();

        }

    }

);


/*======================================
        ESC KEY
======================================*/

document.addEventListener(

    "keydown",

    (e)=>{

        if(

            e.key === "Escape" &&

            modal.classList.contains("active")

        ){

            closeCourseModal();

        }

    }

);


/*======================================
        INITIALIZE
======================================*/

filterCourses();


/*======================================
        FUTURE BACKEND READY
======================================*/

/*

    FUTURE BACKEND:

    The current coursesData object
    can later be replaced with API data.

    Example:

    fetch("/api/courses")

        .then(response => response.json())

        .then(data => {

            // Render courses dynamically

        });

*/