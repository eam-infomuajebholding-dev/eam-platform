import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SiteContent {
  site: {
    title: string;
    subtitle: string;
    description: string;
    email: string;
    phone: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
  };
  about: {
    title: string;
    text: string;
  };
  careers: {
    title: string;
    description: string;
    email: string;
  };
  invest: {
    title: string;
    description: string;
  };
  projects: Array<{
    id: number;
    name: string;
    location: string;
    type: string;
    investmentAmount: string;
    expectedReturn: string;
    duration: string;
    description: string;
    videoUrl: string;
    images: string[];
    pdfUrl: string;
    status: string;
  }>;
}

interface ContentContextType {
  content: SiteContent | null;
  loading: boolean;
  refreshContent: () => void;
}

const ContentContext = createContext<ContentContextType>({
  content: null,
  loading: true,
  refreshContent: () => {},
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const response = await fetch('/content.json?t=' + Date.now());
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const refreshContent = () => {
    setLoading(true);
    fetchContent();
  };

  return (
    <ContentContext.Provider value={{ content, loading, refreshContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext);
}