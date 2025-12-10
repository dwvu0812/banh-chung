import { render, screen, fireEvent } from "@testing-library/react";
import CollocationCard from "@/components/CollocationCard";

describe("CollocationCard", () => {
  const mockCollocation = {
    _id: "1",
    phrase: "make a decision",
    meaning: "đưa ra quyết định",
    components: [
      { word: "make", meaning: "làm", partOfSpeech: "verb" },
      { word: "decision", meaning: "quyết định", partOfSpeech: "noun" },
    ],
    examples: [
      "We need to make a decision about the project.",
      "It's difficult to make a decision without all the information.",
    ],
    pronunciation: "https://example.com/audio.mp3",
    tags: ["make", "decision", "essential"],
    difficulty: "beginner" as const,
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render collocation phrase and meaning", () => {
    render(<CollocationCard collocation={mockCollocation} onClick={mockOnClick} />);

    expect(screen.getByText("make a decision")).toBeInTheDocument();
    expect(screen.getByText("đưa ra quyết định")).toBeInTheDocument();
  });

  it("should display difficulty badge", () => {
    render(<CollocationCard collocation={mockCollocation} onClick={mockOnClick} />);

    expect(screen.getByText("beginner")).toBeInTheDocument();
  });

  it("should display tags", () => {
    render(<CollocationCard collocation={mockCollocation} onClick={mockOnClick} />);

    expect(screen.getByText("make")).toBeInTheDocument();
    expect(screen.getByText("decision")).toBeInTheDocument();
    expect(screen.getByText("essential")).toBeInTheDocument();
  });

  it("should display examples", () => {
    render(<CollocationCard collocation={mockCollocation} onClick={mockOnClick} />);

    expect(screen.getByText(/We need to make a decision/)).toBeInTheDocument();
  });

  it("should expand components when button is clicked", () => {
    render(<CollocationCard collocation={mockCollocation} onClick={mockOnClick} />);

    const expandButton = screen.getByRole("button", { name: /Show Components/i });
    fireEvent.click(expandButton);

    expect(screen.getByText("make")).toBeInTheDocument();
    expect(screen.getByText("làm")).toBeInTheDocument();
    expect(screen.getByText("decision")).toBeInTheDocument();
    expect(screen.getByText("quyết định")).toBeInTheDocument();
  });

  it("should call onClick when card is clicked", () => {
    render(<CollocationCard collocation={mockCollocation} onClick={mockOnClick} />);

    const card = screen.getByText("make a decision").closest(".cursor-pointer");
    if (card) {
      fireEvent.click(card);
    }

    expect(mockOnClick).toHaveBeenCalled();
  });

  it("should render audio button when pronunciation is provided", () => {
    render(<CollocationCard collocation={mockCollocation} onClick={mockOnClick} />);

    const audioButtons = screen.getAllByRole("button");
    const audioButton = audioButtons.find((btn) => btn.querySelector("svg"));

    expect(audioButton).toBeInTheDocument();
  });

  it("should not render audio button when pronunciation is missing", () => {
    const collocationWithoutAudio = {
      ...mockCollocation,
      pronunciation: undefined,
    };

    render(<CollocationCard collocation={collocationWithoutAudio} onClick={mockOnClick} />);

    const buttons = screen.getAllByRole("button");
    const audioButton = buttons.find((btn) => btn.querySelector('svg[class*="Volume"]'));

    expect(audioButton).toBeUndefined();
  });
});

