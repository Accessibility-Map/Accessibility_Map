import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddFeatureButton from "../../AddFeatureButton";
import featureService from "../../services/FeatureService";
import { jest } from "@jest/globals";
import '@testing-library/jest-dom'

describe("AddFeatureButton", () => {
  const locationID = 123;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Test 1: Renders the button and modal correctly
  it("renders the button and modal", () => {
    render(<AddFeatureButton locationID={locationID} />);

    // Check if the button is rendered
    const addButton = screen.getByText("Add Feature");
    expect(addButton).toBeInTheDocument();

    // Check if the modal is initially closed
    const modalTitle = screen.getByText("Add a New Feature");
    expect(modalTitle).toBeInTheDocument();
  });
});