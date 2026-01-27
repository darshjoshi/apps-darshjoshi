// Greenhouse ATS-Optimized Resume Template
// Structured sections for database field mapping, semantic matching support

#set page(
  paper: "us-letter",
  margin: (x: 0.6in, y: 0.5in),
)

#set text(
  font: "Calibri",
  size: 10.5pt,
  hyphenate: false,
)

#set par(
  justify: false,
  leading: 0.6em,
)

// Contact Section - Structured format for field extraction
#align(center)[
  #text(size: 18pt, weight: "bold")[#name]
]

#v(4pt)

#align(center)[
  #text(size: 10pt)[
    #email
    #h(8pt) | #h(8pt)
    #phone
    #h(8pt) | #h(8pt)
    #location
    #if linkedin != none [
      #h(8pt) | #h(8pt)
      #linkedin
    ]
  ]
]

#v(10pt)

// Professional Summary - Keyword-rich for semantic matching
#if summary != none [
  #block(
    width: 100%,
    inset: (y: 4pt),
  )[
    #text(weight: "bold", size: 11pt, fill: rgb("#333"))[Professional Summary]
    #v(2pt)
    #line(length: 100%, stroke: 1pt + rgb("#333"))
    #v(6pt)
    #summary
  ]
  #v(6pt)
]

// Experience Section - Structured for data extraction
#block(
  width: 100%,
  inset: (y: 4pt),
)[
  #text(weight: "bold", size: 11pt, fill: rgb("#333"))[Experience]
  #v(2pt)
  #line(length: 100%, stroke: 1pt + rgb("#333"))
]

#v(4pt)

#for exp in experience [
  #grid(
    columns: (1fr, auto),
    gutter: 8pt,
    [
      #text(weight: "bold", size: 11pt)[#exp.title]

      #text(style: "italic", size: 10pt)[#exp.company]#if exp.location != none [, #exp.location]
    ],
    [
      #align(right)[
        #text(size: 10pt)[#exp.start_date – #exp.end_date]
      ]
    ]
  )

  #v(4pt)

  #for bullet in exp.bullets [
    #grid(
      columns: (12pt, 1fr),
      [•],
      [#bullet]
    )
  ]

  #v(8pt)
]

// Education Section - Structured fields
#block(
  width: 100%,
  inset: (y: 4pt),
)[
  #text(weight: "bold", size: 11pt, fill: rgb("#333"))[Education]
  #v(2pt)
  #line(length: 100%, stroke: 1pt + rgb("#333"))
]

#v(4pt)

#for edu in education [
  #grid(
    columns: (1fr, auto),
    gutter: 8pt,
    [
      #text(weight: "bold")[#edu.degree]

      #text(style: "italic")[#edu.institution]#if edu.location != none [, #edu.location]
      #if edu.gpa != none [

        GPA: #edu.gpa
      ]
    ],
    [
      #if edu.graduation_date != none [
        #align(right)[#edu.graduation_date]
      ]
    ]
  )

  #v(4pt)
]

// Skills Section - Categorized for easy extraction
#v(4pt)

#block(
  width: 100%,
  inset: (y: 4pt),
)[
  #text(weight: "bold", size: 11pt, fill: rgb("#333"))[Skills]
  #v(2pt)
  #line(length: 100%, stroke: 1pt + rgb("#333"))
]

#v(4pt)

#if skills.technical.len() > 0 [
  #text(weight: "bold")[Technical Skills:] #skills.technical.join(", ")

  #v(2pt)
]

#if skills.tools.len() > 0 [
  #text(weight: "bold")[Tools & Technologies:] #skills.tools.join(", ")

  #v(2pt)
]

#if skills.soft.len() > 0 [
  #text(weight: "bold")[Additional Skills:] #skills.soft.join(", ")
]
