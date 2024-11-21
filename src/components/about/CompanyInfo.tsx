interface TeamMember {
  name: string
  title: string
  bio: string
  image: string
}

export function CompanyInfo() {
  const teamMembers: TeamMember[] = [
    {
      name: 'Sarah Johnson',
      title: 'CEO & Founder',
      bio: 'Pioneer in AI and audio technology with 15+ years of experience.',
      image: '/team/sarah.jpg'
    },
    {
      name: 'Michael Chen',
      title: 'CTO',
      bio: 'Machine learning expert specializing in voice synthesis and recognition.',
      image: '/team/michael.jpg'
    },
    {
      name: 'Elena Rodriguez',
      title: 'Head of Product',
      bio: 'Product strategist focused on creating intuitive AI-powered solutions.',
      image: '/team/elena.jpg'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Company Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Our Story</h2>
        <p className="text-white/80 leading-relaxed">
          AUDIOMAX was founded in 2023 with a vision to revolutionize audio content creation through AI technology. 
          We believe in making professional-quality audio accessible to everyone, from content creators to educators 
          and storytellers. Our cutting-edge voice cloning and audio generation technology enables users to create 
          authentic, engaging content that resonates with their audience.
        </p>
      </div>

      {/* Team Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Our Team</h2>
        <div className="space-y-6">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="flex items-center gap-6 p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex-1">
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-primary text-sm mb-2">{member.title}</p>
                <p className="text-white/60 text-sm">{member.bio}</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/10 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission & Values */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Mission & Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="font-semibold mb-2">Our Mission</h3>
            <p className="text-white/60 text-sm">
              To democratize audio content creation through innovative AI technology.
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="font-semibold mb-2">Our Values</h3>
            <ul className="text-white/60 text-sm space-y-1">
              <li>Innovation & Excellence</li>
              <li>User Privacy & Security</li>
              <li>Accessibility & Inclusion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}