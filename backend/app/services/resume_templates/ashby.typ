// Ashby ATS-Optimized Resume Template
// Achievement-focused, metrics prominently displayed, career progression visible
// Optimized for single page output

#set page(
  paper: "us-letter",
  margin: (x: 0.5in, y: 0.4in),
)

#set text(
  font: "Helvetica",
  size: 9.5pt,
  hyphenate: false,
)

#set par(
  justify: false,
  leading: 0.5em,
)

// Header - Clean and professional
#block(
  width: 100%,
  stroke: (bottom: 1.5pt + black),
  inset: (bottom: 6pt),
)[
  #text(size: 16pt, weight: "bold", tracking: 0.3pt)[#upper(name)]
  #v(2pt)
  #text(size: 9pt, fill: rgb("#444"))[
    #email #h(5pt) • #h(5pt) #phone #h(5pt) • #h(5pt) #location
    #if linkedin != none [
      #h(5pt) • #h(5pt) #linkedin
    ]
  ]
]

#v(8pt)

// Professional Summary - Impact-focused
#if summary != none [
  #text(weight: "bold", size: 10pt, tracking: 0.2pt)[PROFESSIONAL SUMMARY]
  #v(3pt)
  #text(size: 9pt)[#summary]
  #v(6pt)
]

// Experience Section - Achievement-focused with metrics
#text(weight: "bold", size: 10pt, tracking: 0.2pt)[PROFESSIONAL EXPERIENCE]
#v(4pt)

#for exp in experience [
  #block(
    width: 100%,
    stroke: (left: 1.5pt + rgb("#333")),
    inset: (left: 8pt, y: 2pt),
  )[
    #grid(
      columns: (1fr, auto),
      gutter: 4pt,
      [
        #text(weight: "bold", size: 9.5pt)[#exp.title]
        #text(size: 9pt, fill: rgb("#444"))[ — #exp.company]#if exp.location != none [#text(size: 9pt, fill: rgb("#666"))[ | #exp.location]]
      ],
      [#text(size: 9pt, weight: "medium")[#exp.start_date – #exp.end_date]]
    )
    #v(2pt)
    #for bullet in exp.bullets [
      #text(size: 9pt)[▸ #bullet]
      #v(0.5pt)
    ]
  ]
  #v(4pt)
]

// Skills Section - Comprehensive with categories
#text(weight: "bold", size: 10pt, tracking: 0.2pt)[CORE COMPETENCIES]
#v(4pt)

#block(
  width: 100%,
  fill: rgb("#f5f5f5"),
  inset: 8pt,
  radius: 2pt,
)[
  #if skills.technical.len() > 0 [
    #text(size: 9pt)[#text(weight: "bold")[Technical:] #skills.technical.join(" • ")]
    #v(2pt)
  ]

  #if skills.tools.len() > 0 [
    #text(size: 9pt)[#text(weight: "bold")[Tools:] #skills.tools.join(" • ")]
    #v(2pt)
  ]

  #if skills.soft.len() > 0 [
    #text(size: 9pt)[#text(weight: "bold")[Leadership:] #skills.soft.join(" • ")]
  ]
]

#v(6pt)

// Education Section - Concise but complete
#text(weight: "bold", size: 10pt, tracking: 0.2pt)[EDUCATION]
#v(4pt)

#for edu in education [
  #grid(
    columns: (1fr, auto),
    gutter: 4pt,
    [
      #text(weight: "bold", size: 9.5pt)[#edu.degree]
      #text(size: 9pt, fill: rgb("#444"))[ — #edu.institution]#if edu.location != none [#text(size: 9pt)[, #edu.location]]
      #if edu.gpa != none [#text(size: 9pt, fill: rgb("#666"))[ | GPA: #edu.gpa]]
    ],
    [#if edu.graduation_date != none [#text(size: 9pt)[#edu.graduation_date]]]
  )
  #v(2pt)
]
