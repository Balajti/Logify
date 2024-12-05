import { render, screen } from '@testing-library/react';
import LandingPage from '@/app/page';
import '@testing-library/jest-dom';


jest.mock('@/components/ui/button', () => ({
  Button: (props: any) => <div {...props} data-testid="mock-button" />
}));

describe('LandingPage', () => {
    it('renders the page title', () => {
    render(<LandingPage />);
        
    
        const title = screen.getByText(/Track Time, Manage Projects/i);
        expect(title).toBeInTheDocument();
    });

  it('renders feature list', () => {
    render(<LandingPage />);
    
    
    const features = [
      'Time tracking with automated timesheets',
      'Project and task management',
      'Team collaboration tools',
      'Real-time analytics and reporting',
      'Role-based access control',
      'Performance monitoring',
    ];
    
    features.forEach((feature) => {
      const featureElement = screen.getByText(feature);
      expect(featureElement).toBeInTheDocument();
    });
  });

  it('renders footer with company links', () => {
    render(<LandingPage />);
    
    
    const companyTitle = screen.getByText(/Company/i);
    const aboutLink = screen.getByText(/About/i);
    
    expect(companyTitle).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
  });

  it('does not render actual Button component', () => {
    render(<LandingPage />);
    
    
    const buttons = screen.queryAllByTestId('mock-button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
