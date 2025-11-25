import { render, screen, fireEvent } from '@testing-library/react';
import { RatingButtons } from '@/components/review/RatingButtons';

describe('RatingButtons', () => {
  const mockOnRate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all rating buttons', () => {
    render(<RatingButtons onRate={mockOnRate} />);

    expect(screen.getByText('Again')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('calls onRate with correct quality when Again is clicked', () => {
    render(<RatingButtons onRate={mockOnRate} />);

    fireEvent.click(screen.getByText('Again'));
    expect(mockOnRate).toHaveBeenCalledWith(0);
  });

  it('calls onRate with correct quality when Hard is clicked', () => {
    render(<RatingButtons onRate={mockOnRate} />);

    fireEvent.click(screen.getByText('Hard'));
    expect(mockOnRate).toHaveBeenCalledWith(3);
  });

  it('calls onRate with correct quality when Good is clicked', () => {
    render(<RatingButtons onRate={mockOnRate} />);

    fireEvent.click(screen.getByText('Good'));
    expect(mockOnRate).toHaveBeenCalledWith(4);
  });

  it('calls onRate with correct quality when Easy is clicked', () => {
    render(<RatingButtons onRate={mockOnRate} />);

    fireEvent.click(screen.getByText('Easy'));
    expect(mockOnRate).toHaveBeenCalledWith(5);
  });

  it('disables buttons when disabled prop is true', () => {
    render(<RatingButtons onRate={mockOnRate} disabled={true} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});

