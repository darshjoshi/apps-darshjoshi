// Ashby ATS-Optimized Resume Template
// Achievement-focused, metrics prominently displayed, career progression visible

#set page(
  paper: "us-letter",
  margin: (x: 0.55in, y: 0.5in),
)

#set text(
  font: "Helvetica",
  size: 10pt,
  hyphenate: false,
)

#set par(
  justify: false,
  leading: 0.55em,
)

// Header - Clean and professional
#block(
  width: 100%,
  stroke: (bottom: 2pt + black),
  inset: (bottom: 8pt),
)[
  #text(size: 20pt, weight: "bold", tracking: 0.5pt)[#upper(name)]

  #v(4pt)

  #text(size: 10pt, fill: rgb("#444"))[
    #email #h(6pt) • #h(6pt) #phone #h(6pt) • #h(6pt) #location
    #if linkedin != none [
      #h(6pt) • #h(6pt) #linkedin
    ]
  ]
]

#v(10pt)

// Professional Summary - Impact-focused
#if summary != none [
  #text(weight: "bold", size: 11pt, tracking: 0.3pt)[PROFESSIONAL SUMMARY]
  #v(4pt)
  #block(
    width: 100%,
    fill: rgb("#f8f8f8"),
    inset: 8pt,
    radius: 2pt,
  )[
    #summary
  ]
  #v(10pt)
]

// Experience Section - Achievement-focused with metrics
#text(weight: "bold", size: 11pt, tracking: 0.3pt)[PROFESSIONAL EXPERIENCE]
#v(6pt)

#for exp in experience [
  #block(
    width: 100%,
    stroke: (left: 2pt + rgb("#333")),
    inset: (left: 10pt, y: 4pt),
  )[
    #grid(
      columns: (1fr, auto),
      gutter: 8pt,
      [
        #text(weight: "bold", size: 11pt)[#exp.title]

        #text(size: 10pt, fill: rgb("#444"))[#exp.company]#if exp.location != none [#text(fill: rgb("#666"))[ | #exp.location]]
      ],
      [
        #align(right)[
          #text(size: 10pt, weight: "medium")[#exp.start_date – #exp.end_date]
        ]
      ]
    )

    #v(4pt)

    // Achievements with bullet points
    #for bullet in exp.bullets [
      #grid(
        columns: (10pt, 1fr),
        gutter: 4pt,
        [▸],
        [#bullet]
      )
      #v(1pt)
    ]
  ]

  #v(8pt)
]

// Skills Section - Comprehensive with categories
#text(weight: "bold", size: 11pt, tracking: 0.3pt)[CORE COMPETENCIES]
#v(6pt)

#block(
  width: 100%,
  fill: rgb("#f8f8f8"),
  inset: 10pt,
  radius: 2pt,
)[
  #if skills.technical.len() > 0 [
    #text(weight: "bold", size: 9pt, fill: rgb("#444"))[TECHNICAL]
    #v(2pt)
    #text(size: 10pt)[#skills.technical.join(" • ")]
    #v(6pt)
  ]

  #if skills.tools.len() > 0 [
    #text(weight: "bold", size: 9pt, fill: rgb("#444"))[TOOLS & PLATFORMS]
    #v(2pt)
    #text(size: 10pt)[#skills.tools.join(" • ")]
    #v(6pt)
  ]

  #if skills.soft.len() > 0 [
    #text(weight: "bold", size: 9pt, fill: rgb("#444"))[LEADERSHIP & SOFT SKILLS]
    #v(2pt)
    #text(size: 10pt)[#skills.soft.join(" • ")]
  ]
]

#v(10pt)

// Education Section - Concise but complete
#text(weight: "bold", size: 11pt, tracking: 0.3pt)[EDUCATION]
#v(6pt)

#for edu in education [
  #grid(
    columns: (1fr, auto),
    gutter: 8pt,
    [
      #text(weight: "bold")[#edu.degree]

      #text(fill: rgb("#444"))[#edu.institution]#if edu.location != none [, #edu.location]
      #if edu.gpa != none [#text(fill: rgb("#666"))[ | GPA: #edu.gpa]]
    ],
    [
      #if edu.graduation_date != none [
        #align(right)[#edu.graduation_date]
      ]
    ]
  )

  #v(4pt)
]
