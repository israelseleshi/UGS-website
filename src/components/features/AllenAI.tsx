import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  FileText, 
  Clock, 
  ThumbsUp, 
  ThumbsDown,
  Copy,
  RotateCcw,
  Paperclip,
  Mic,
  MicOff
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'allen';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'document';
  suggestions?: string[];
}

interface AllenAIProps {
  onPageChange: (page: string) => void;
}

export function AllenAI({ onPageChange }: AllenAIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Allen, your AI visa consultant. I can help you with visa applications, requirements, documentation, and answer any immigration-related questions. How can I assist you today?",
      sender: 'allen',
      timestamp: new Date(),
      type: 'text',
      suggestions: [
        "What documents do I need for a tourist visa?",
        "How long does visa processing take?",
        "Help me choose the right visa type",
        "Check my application status"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const allenResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAllenResponse(userMessage.content),
        sender: 'allen',
        timestamp: new Date(),
        type: 'text',
        suggestions: generateSuggestions(userMessage.content)
      };

      setMessages(prev => [...prev, allenResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAllenResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('tourist') || input.includes('tourism')) {
      return "For a tourist visa, you'll typically need: 1) Valid passport (6+ months validity), 2) Completed visa application form, 3) Passport-size photos, 4) Proof of accommodation, 5) Flight itinerary, 6) Financial statements, 7) Travel insurance. Processing time is usually 5-15 business days. Would you like specific information for a particular country?";
    } else if (input.includes('student') || input.includes('study')) {
      return "Student visa requirements include: 1) Letter of acceptance from institution, 2) Proof of financial support, 3) Academic transcripts, 4) Statement of purpose, 5) IELTS/TOEFL scores, 6) Medical examination, 7) Police clearance. I can help you understand requirements for specific countries or assist with your application strategy.";
    } else if (input.includes('work') || input.includes('employment')) {
      return "Work visa applications typically require: 1) Job offer letter, 2) Labor certification, 3) Educational credentials, 4) Work experience proof, 5) Medical examination, 6) Background check. The process varies significantly by country. Which destination are you considering?";
    } else if (input.includes('processing') || input.includes('time')) {
      return "Visa processing times vary by country and type: Tourist visas: 5-15 days, Student visas: 2-8 weeks, Work visas: 1-6 months, Immigration visas: 6 months-2 years. Express processing is available for some visa types. I can provide specific timelines for your destination.";
    } else if (input.includes('documents') || input.includes('requirements')) {
      return "Standard documents for most visa applications: 1) Valid passport, 2) Application form, 3) Photos, 4) Financial proof, 5) Purpose-specific documents (invitation, admission letter, job offer), 6) Travel insurance, 7) Medical records (if required). Each visa type has additional specific requirements.";
    } else {
      return "I understand you're looking for visa guidance. I can help with specific visa types, country requirements, document checklists, processing times, and application strategies. Could you share more details about your travel plans or visa type you're interested in?";
    }
  };

  const generateSuggestions = (userInput: string): string[] => {
    const input = userInput.toLowerCase();
    
    if (input.includes('tourist')) {
      return [
        "Show me tourist visa checklist for USA",
        "What's the success rate for tourist visas?",
        "Help with visa interview preparation",
        "Tourist visa processing timeline"
      ];
    } else if (input.includes('student')) {
      return [
        "Best countries for international students",
        "Student visa financial requirements",
        "How to write statement of purpose",
        "Post-study work opportunities"
      ];
    } else {
      return [
        "Compare visa requirements by country",
        "Schedule a consultation call",
        "Check visa application status",
        "Get document templates"
      ];
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: FileText, label: 'Document Checker', action: () => {} },
    { icon: Clock, label: 'Processing Times', action: () => {} },
    { icon: User, label: 'Consultation', action: () => onPageChange('request') },
    { icon: MessageCircle, label: 'FAQ', action: () => {} }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-indigo-50/30 dark:from-blue-950/10 dark:via-background dark:to-indigo-950/5">
      <div className="site-container site-max py-24 md:py-28">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Meet Allen</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered visa consultant. Get instant answers to visa questions, document guidance, and personalized advice available 24/7.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Quick Actions Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="rounded-2xl shadow-sm ring-1 ring-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3"
                      onClick={action.action}
                    >
                      <action.icon className="w-4 h-4 mr-3" />
                      <span className="text-sm">{action.label}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm ring-1 ring-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Allen's Capabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Real-time visa guidance</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <FileText className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Document verification</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>Processing timeline estimates</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MessageCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>24/7 availability</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[700px] flex flex-col rounded-2xl shadow-sm ring-1 ring-border/50">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          <Bot className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">Allen AI</h3>
                        <div className="flex items-center text-sm text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          Online
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Powered
                    </Badge>
                  </div>
                </CardHeader>

                {/* Messages Area */}
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <Avatar className="w-8 h-8">
                              {message.sender === 'allen' ? (
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                                  <Bot className="w-4 h-4" />
                                </AvatarFallback>
                              ) : (
                                <AvatarFallback className="bg-primary text-white text-xs">
                                  <User className="w-4 h-4" />
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className={`flex flex-col space-y-1 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                              <div className={`p-3 rounded-2xl ${
                                message.sender === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm leading-relaxed">{message.content}</p>
                              </div>
                              
                              {/* Suggestions */}
                              {message.suggestions && message.suggestions.length > 0 && (
                                <div className="space-y-2 mt-2">
                                  {message.suggestions.map((suggestion, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      className="text-xs h-8 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/20"
                                      onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                      {suggestion}
                                    </Button>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {message.sender === 'allen' && (
                                  <div className="flex space-x-1">
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <ThumbsUp className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <ThumbsDown className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Typing Indicator */}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="flex space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                                <Bot className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-muted p-3 rounded-2xl">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 relative">
                        <Input
                          ref={inputRef}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask Allen about visas, requirements, or immigration..."
                          className="pr-12"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-8 w-8 p-0"
                          onClick={() => setIsListening(!isListening)}
                        >
                          {isListening ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                        </Button>
                      </div>
                      <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Allen can make mistakes. Please verify important information with our human consultants.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}