import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges
} from "@angular/core";
import { Utility } from "src/app/Model/utility";

@Component({
  selector: "app-action-confirmation",
  templateUrl: "./action-confirmation.component.html",
  styleUrls: ["./action-confirmation.component.css"]
})
export class ActionConfirmationComponent implements OnInit, OnChanges {
  public ConfirmationMessage: string;
  ConfirmationTitle: string;
  private clsUtility: Utility;

  // Received Input from parent component
  @Input() InputConfirmationMessage: any;
  @Input() InputConfirmationTitle: any;

  // Send Output to parent component
  @Output() OutputConfirmationResult = new EventEmitter<boolean>();

  constructor() {
    this.clsUtility = new Utility();
  }

  ngOnInit() {
    try {
      if (this.InputConfirmationMessage != null) {
        this.ConfirmationMessage = this.InputConfirmationMessage;
      }
      if (this.InputConfirmationTitle != null) {
        this.ConfirmationTitle = this.InputConfirmationTitle;
      }
      this.OutputConfirmationResult.emit(false);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnChanges() {
    try {
      if (this.InputConfirmationMessage != null) {
        this.ConfirmationMessage = this.InputConfirmationMessage;
      }
      if (this.InputConfirmationTitle != null) {
        this.ConfirmationTitle = this.InputConfirmationTitle;
      }
      // this.OutputConfirmationResult.emit(false);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onYes() {
    try {
      this.OutputConfirmationResult.emit(true);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onNo() {
    try {
      this.OutputConfirmationResult.emit(false);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
