import { Component, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { EasyFactorEnum } from '../../../easy-factor.enum';

@Component({
  selector: 'app-tools',
  imports: [MatButton],
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.scss',
})
export class ToolsComponent {
  public selectedCardNumber = input.required();
  public selectAll = output();
  public deselectAll = output();
  public mixedAnswer = output();
  public answerCards = output<EasyFactorEnum>();

  protected readonly EasyFactorEnum = EasyFactorEnum;
}
