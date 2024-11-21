interface FAQSectionProps {
  searchQuery: string
}

export function FAQSection({ searchQuery }: FAQSectionProps) {
  const faqs = [
    {
      question: 'What is AUDIOMAX?',
      answer: 'AUDIOMAX is an AI-powered audio generation platform that allows you to create high-quality audio content using advanced voice cloning and text-to-speech technology.'
    },
    {
      question: 'How does voice cloning work?',
      answer: 'Voice cloning uses AI to analyze and replicate your voice patterns. Simply provide a few minutes of clear voice samples, and our system will create a digital clone of your voice.'
    },
    {
      question: 'How many voices can I clone?',
      answer: 'The number of voices you can clone depends on your subscription plan. Basic users can clone up to 3 voices, Pro users up to 10 voices, and Enterprise users have unlimited voice cloning.'
    },
    {
      question: 'What are tokens and how do they work?',
      answer: 'Tokens are the currency used for generating audio content. Each audio generation consumes tokens based on length and complexity. Your subscription includes a monthly token allowance.'
    },
    {
      question: 'How do I ensure the best voice cloning quality?',
      answer: 'For best results, record in a quiet environment, use a good microphone, speak clearly and naturally, and provide at least 3 minutes of high-quality audio samples.'
    }
  ]

  const filteredFaqs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
      
      {filteredFaqs.length === 0 ? (
        <p className="text-white/60 text-center py-8">
          No FAQs found matching your search.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
            >
              <h3 className="font-medium mb-2">{faq.question}</h3>
              <p className="text-white/60">{faq.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}