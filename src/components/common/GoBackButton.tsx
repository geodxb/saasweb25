import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface GoBackButtonProps {
  className?: string;
}

export default function GoBackButton({ className = '' }: GoBackButtonProps) {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={`mb-4 ${className}`} 
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  );
}