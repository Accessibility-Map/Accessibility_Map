import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";
import '@testing-library/jest-dom'

import AvatarButton from "../../AvatarButton";

describe("AvatarButton", () => {
    const updateUser= () => {};

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    // Test 1: Renders the button and modal correctly
    it("renders the button and modal", () => {
        
        render(<AvatarButton UpdateUser={updateUser}/>);

        // Check if the button is rendered
        const avatarButton = document.querySelector(".avatar-button");
        expect(avatarButton).toBeInTheDocument();

        // Check if the modal
        const modalTitle = screen.getByText("Login");
        expect(modalTitle).toBeInTheDocument();
    });
});