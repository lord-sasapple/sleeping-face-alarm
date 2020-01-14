const int vol_pin = 1;
void setup() {
  Serial.begin(9600);  // シリアル通信速度
}
void loop() {
  int ain = analogRead(vol_pin);
  //入力を書き出す
  Serial.println(ain);
  delay(1000);
}
