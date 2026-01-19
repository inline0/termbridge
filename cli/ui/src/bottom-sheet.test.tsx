import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomSheet } from "./bottom-sheet";

describe("BottomSheet", () => {
  it("applies content class names and renders the bleeding background", () => {
    render(
      <BottomSheet.Root>
        <BottomSheet.View>
          <BottomSheet.Content className="extra-class">
            <div>Sheet Body</div>
          </BottomSheet.Content>
        </BottomSheet.View>
      </BottomSheet.Root>
    );

    const body = screen.getByText("Sheet Body");
    const content = body.closest(".BottomSheet-content");

    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("BottomSheet-content");
    expect(content).toHaveClass("extra-class");
    expect(content?.querySelector(".BottomSheet-bleedingBackground")).toBeInTheDocument();
  });

  it("renders content with default class names", () => {
    render(
      <BottomSheet.Root>
        <BottomSheet.View>
          <BottomSheet.Content>
            <div>Default Content</div>
          </BottomSheet.Content>
        </BottomSheet.View>
      </BottomSheet.Root>
    );

    const body = screen.getByText("Default Content");
    const content = body.closest(".BottomSheet-content");

    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("BottomSheet-content");
  });
});
