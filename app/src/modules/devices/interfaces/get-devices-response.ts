export interface GetDevicesResponse {
  data:          Device[];
  totalPages:    number;
  totalElements: number;
  hasNext:       boolean;
}

export interface Device {
  id:          DeviceID;
  createdTime: number;
  name:        string;
  type:        string;
  label:       string;
}

export interface DeviceID {
  entityType: string;
  id:         string;
}
