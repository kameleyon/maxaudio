export function Careers() {
  const openings = [
    {
      title: 'Senior ML Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time'
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time'
    },
    {
      title: 'Technical Support Specialist',
      department: 'Customer Success',
      location: 'Remote',
      type: 'Full-time'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Join Our Team</h2>
        <p className="text-white/80 leading-relaxed">
          We're looking for passionate individuals who want to shape the future of audio technology. 
          At AUDIOMAX, you'll work with cutting-edge AI technology and collaborate with talented 
          professionals from around the world.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Open Positions</h2>
        <div className="space-y-4">
          {openings.map((job) => (
            <div
              key={job.title}
              className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{job.title}</h3>
                  <p className="text-white/60 text-sm">{job.department}</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
                    {job.location}
                  </span>
                  <span className="px-2 py-1 text-xs bg-white/10 text-white/80 rounded-full">
                    {job.type}
                  </span>
                </div>
              </div>
              <button className="mt-4 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="font-medium mb-2">Health & Wellness</h3>
            <ul className="text-white/60 text-sm space-y-1">
              <li>Comprehensive health insurance</li>
              <li>Mental health support</li>
              <li>Wellness programs</li>
            </ul>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="font-medium mb-2">Growth & Development</h3>
            <ul className="text-white/60 text-sm space-y-1">
              <li>Learning & development budget</li>
              <li>Conference attendance</li>
              <li>Career mentorship</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}