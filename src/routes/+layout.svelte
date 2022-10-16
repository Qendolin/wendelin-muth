<noscript>
  <dialog open class="js-disabled-dialog">
    <form method="dialog">
      <strong><h2>This Website requires JavaScript to be enabled!</h2></strong>
      <p>Thank you for your understanding.</p>
      <button type="submit" autofocus>Ok</button>
    </form>
  </dialog>
</noscript>
<slot />

<style>
  .js-disabled-dialog {
    position: fixed;
    inset: 0;
  }
  .js-disabled-dialog button[type='submit'] {
    float: right;
  }
  noscript:has([open].js-disabled-dialog) {
    position: fixed;
    inset: 0;
    background: #00000080;
  }
</style>
