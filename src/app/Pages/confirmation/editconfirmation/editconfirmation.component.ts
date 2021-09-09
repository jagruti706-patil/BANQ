import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Utility } from 'src/app/Model/utility';
@Component({
  selector: 'app-editconfirmation',
  templateUrl: './editconfirmation.component.html',
  styleUrls: ['./editconfirmation.component.css']
})
export class EditconfirmationComponent implements OnInit, OnChanges {
  public EditMessage: string;
  private clsUtility: Utility;

  // Received Input from parent component
  @Input() InputEditMessage: any;

  // Send Output to parent component
  @Output() OutputEditResult = new EventEmitter<boolean>();

  constructor() {
    this.clsUtility = new Utility();
  }

  ngOnInit() {
    try {
      if (this.InputEditMessage != null) {
        this.EditMessage = this.InputEditMessage;
      }
      this.OutputEditResult.emit(false);
    }
    catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnChanges() {
    try {
      if (this.InputEditMessage != null) {
        this.EditMessage = this.InputEditMessage;
      }
      this.OutputEditResult.emit(false);
    }
    catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onYes() {
    try {
      this.OutputEditResult.emit(true);
    }
    catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onNo() {
    try {
      this.OutputEditResult.emit(false);
    }
    catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}