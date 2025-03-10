import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";
import '@testing-library/jest-dom'

import CommentList from "../../CommentList";

describe("CommentList", () => {
    // Test 1: Renders the comment list correctly
    it("renders the comment list", () => {
        const locationID = 123;
        const userID = 1;
        const user = {username: "testUser"};

        render(<CommentList locationID={locationID} userID={userID} user={user} />);

        // Check if the comment list is rendered
        const commentList = screen.getByTestId("comment-list");
        expect(commentList).toBeInTheDocument();
    });
});