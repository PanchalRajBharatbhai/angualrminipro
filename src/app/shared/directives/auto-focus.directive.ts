import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true,
})
export class AutoFocusDirective implements OnInit {
  constructor(private el: ElementRef<HTMLInputElement | HTMLElement>) {}

  ngOnInit(): void {
    setTimeout(() => {
      if (this.el.nativeElement && typeof this.el.nativeElement.focus === 'function') {
        this.el.nativeElement.focus();
      }
    }, 50);
  }
}
