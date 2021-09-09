import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Utility } from 'src/app/Model/utility';
@Component({
  selector: 'app-deleteconfirmation',
  templateUrl: './deleteconfirmation.component.html',
  styleUrls: ['./deleteconfirmation.component.css']
})
export class DeleteconfirmationComponent implements OnInit, OnChanges {
  public DeleteMessage: string;
  private clsUtility: Utility;

  // Received Input from parent component
  @Input() InputDeleteMessage: any;

  // Send Output to parent component
  @Output() OutputDeleteResult = new EventEmitter<boolean>();

  constructor() {
    this.clsUtility = new Utility();
  }

  ngOnInit() {
    try {
      if (this.InputDeleteMessage != null) {
        this.DeleteMessage = this.InputDeleteMessage;
      }
      this.OutputDeleteResult.emit(false);
    }
    catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnChanges() {
    try {
      if (this.InputDeleteMessage != null) {
        this.DeleteMessage = this.InputDeleteMessage;
      }
      this.OutputDeleteResult.emit(false);
    }
    catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onYes() {
    try {
      this.OutputDeleteResult.emit(true);
    }
    catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onNo() {
    try {
      this.OutputDeleteResult.emit(false);
    }
    catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}