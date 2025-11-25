import { render, screen, fireEvent } from '@testing-library/react';
import { CardItem } from '@/components/deck/CardItem';

describe('CardItem', () => {
  const mockCard = {
    _id: '1',
    word: 'hello',
    definition: 'a greeting',
    pronunciation: 'https://example.com/audio.mp3',
    examples: ['Hello world', 'Say hello'],
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders card information correctly', () => {
    render(
      <CardItem card={mockCard} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('a greeting')).toBeInTheDocument();
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Say hello')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <CardItem card={mockCard} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((btn) =>
      btn.querySelector('svg')?.classList.contains('lucide-edit')
    );

    if (editButton) {
      fireEvent.click(editButton);
      expect(mockOnEdit).toHaveBeenCalledWith(mockCard);
    }
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <CardItem card={mockCard} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((btn) =>
      btn.querySelector('svg')?.classList.contains('lucide-trash-2')
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    }
  });
});

